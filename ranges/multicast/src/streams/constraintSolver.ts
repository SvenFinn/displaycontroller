import { TypedTransform } from "dc-streams";
import { Candidate, CandidateDiscipline, CandidateOverrideDiscipline, CandidateStartList, isOverride, PacketCandidates, ResolvedPacketCandidates } from "../types";
import { TransformCallback } from "node:stream";
import { StartList } from "dc-ranges-types";
import { logger } from "dc-logger";

export class ConstraintSolver extends TypedTransform<PacketCandidates, ResolvedPacketCandidates> {
    private removeOverlaps<T>(candidates: Candidate<T>[], toRemove: Candidate<any>): Candidate<T>[] {
        // Remove candidates that overlap with toRemove
        return candidates.filter(candidate => candidate.end <= toRemove.start || candidate.start >= toRemove.end);
    }

    private hasAnyOverlaps(candidates: PacketCandidates, b: Candidate<any>): boolean {
        return candidates.disciplineCandidates.some(candidate => !(candidate.end <= b.start || candidate.start >= b.end)) ||
            candidates.startListCandidates.some(candidate => !(candidate.end <= b.start || candidate.start >= b.end)) ||
            candidates.shooterCandidates.some(candidate => !(candidate.end <= b.start || candidate.start >= b.end));
    }

    private resolveCandidate<K extends keyof ResolvedPacketCandidates>(
        candidates: ResolvedPacketCandidates,
        key: K,
        candidate: Candidate<any>,
    ): ResolvedPacketCandidates {
        logger.debug(`Resolving ${key} to ${candidate.match} based on candidate at position (${candidate.start},${candidate.end})`);
        // print remaining candidates after filtering
        const filteredDisciplineCandidates = key === "discipline" ? [] : this.removeOverlaps(candidates.disciplineCandidates, candidate);
        const filteredStartListCandidates = key === "startList" ? [] : this.removeOverlaps(candidates.startListCandidates, candidate);
        const filteredShooterCandidates = key === "shooter" ? [] : this.removeOverlaps(candidates.shooterCandidates, candidate);
        logger.debug(`Remaining discipline candidates after resolving ${key}: ${filteredDisciplineCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        logger.debug(`Remaining start list candidates after resolving ${key}: ${filteredStartListCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        logger.debug(`Remaining shooter candidates after resolving ${key}: ${filteredShooterCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        return {
            ...candidates,
            [key]: candidate.data,
            disciplineCandidates: filteredDisciplineCandidates,
            startListCandidates: filteredStartListCandidates,
            shooterCandidates: filteredShooterCandidates
        } as ResolvedPacketCandidates;
    }

    private resolveStartList(candidates: ResolvedPacketCandidates): ResolvedPacketCandidates {
        if (candidates.startListCandidates.length === 1) {
            //logger.debug(`Only one start list candidate remains, resolving to ${candidates.startListCandidates[0].match}`);
            const candidate = candidates.startListCandidates[0];
            return this.resolveCandidate(candidates, "startList", candidate);
        }
        // if all remaining start list candidates point to the same start list (and they have no overlaps with candidates of other types), this start list is selected as the identified start list, as it is likely that the different candidates are just different parts of the same start list name. This reflects the domain observation, that, while technically possible, it is unlikely for a range to contain multiple different start lists, as this would usually indicate a misconfiguration of the range.

        const candidatesWithoutStartListCandidates = {
            ...candidates,
            startListCandidates: [] // This should ignore any start list candidates in the overlap check, as we want to check if any start list candidate overlaps with candidates of other types.
        };
        const startListIds = new Set(candidates.startListCandidates.map(candidate => candidate.data.id));
        if (startListIds.size === 1 && !candidates.startListCandidates.some(candidate => this.hasAnyOverlaps(candidatesWithoutStartListCandidates, candidate))) {
            const candidate = candidates.startListCandidates[0];
            return this.resolveCandidate(candidates, "startList", candidate);
        }
        return candidates;
    }

    private filterDisciplinesByStartList(candidates: ResolvedPacketCandidates): Candidate<CandidateDiscipline>[] {
        const startLists = candidates.startListCandidates.map(candidate => candidate.data);
        if (candidates.startList) {
            startLists.push(candidates.startList);
        }
        const disciplineCandidates = candidates.disciplineCandidates;
        if (startLists.length === 0) {
            return disciplineCandidates;
        }

        const overrideStartListIds = startLists
            .filter(candidate => candidate.hasOverrideDisciplines)
            .map(candidate => candidate.id);
        const overrideStartListIdsSet = new Set(overrideStartListIds);

        // Check if all identified start list candidates are price shooting start lists
        if (overrideStartListIds.length === startLists.length) {
            // If all identified start list candidates are price shooting start lists, only retain discipline candidates that belong to specializations of these price shootings or base disciplines, as these are the only disciplines that can be used in price shooting contexts
            return disciplineCandidates.filter(candidate => {
                const discipline = candidate.data;
                return !isOverride(discipline) || overrideStartListIdsSet.has(discipline.startListId);
            });
        }

        if (overrideStartListIds.length === 0) {
            // If none of the identified start list candidates are price shooting start lists, only retain discipline candidates that do not belong to any price shooting specialization, as these are the only disciplines that can be used in non-price shooting contexts
            return disciplineCandidates.filter(candidate => {
                const discipline = candidate.data;
                return !isOverride(discipline) // Only specialization disciplines have a startListId
            });
        }
        // If there is a mix of price shooting and non-price shooting start list candidates, no discipline candidates can be safely removed, as it is unclear which start list candidate is correct
        return disciplineCandidates;
    }

    private resolveDiscipline(candidates: ResolvedPacketCandidates): ResolvedPacketCandidates {
        if (candidates.discipline) {
            return candidates;
        }
        const disciplineCandidates = this.filterDisciplinesByStartList(candidates);
        logger.debug(`After filtering disciplines by start list, ${disciplineCandidates.length} discipline candidates remain: ${disciplineCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        if (disciplineCandidates.length === 1) {
            // If, after contextual filtering, exactly one discipline candidate remains, it is accepted as the identified discipline.
            const discipline = disciplineCandidates[0];
            return this.resolveCandidate(candidates, "discipline", discipline);
        }
        // This combination is only considered, if none of the remaining discipline candidates overlap with candidates of other entity types. If such overlaps exist, no combination logic is applied, as removing candidates could discard important contextual information.
        const filteredCandidates = {
            ...candidates,
            disciplineCandidates: [] // This should ignore any discipline candidates in the overlap check, as we want to check if any discipline candidate overlaps with candidates of other types.
        }
        if (disciplineCandidates.some(candidate => this.hasAnyOverlaps(filteredCandidates, candidate))) {
            logger.debug(`Multiple discipline candidates remain, but at least one overlaps with candidates of other types, cannot resolve discipline`);
            return filteredCandidates;
        }

        // - If all specialization candidates point to the same specialization and this specialization belongs to the start list (or any of the start list candidates, as identified above), the specialization is selected as the final discipline. This reflects the domain observation, that, while technically possible, it is unlikely for a non-specialized discipline to be used in combination with a price shooting
        // We do not need to check for start lists here, as the filtering is done in the filterDisciplinesByStartList 
        const specializationCandidates = disciplineCandidates.filter(candidate => isOverride(candidate.data)) as unknown as Array<Candidate<CandidateOverrideDiscipline>>;
        if (specializationCandidates.length > 0) {
            const specializationIds = new Set(specializationCandidates.map(candidate => candidate.data.overrideId));
            if (specializationIds.size === 1) {
                logger.debug(`Multiple specialization candidates remain, but they all belong to the same specialization, resolving to ${specializationCandidates[0].match} (${specializationCandidates[0].data.overrideId})`);
                const specializationCandidate = specializationCandidates[0];
                return this.resolveCandidate(candidates, "discipline", specializationCandidate);
            }
        }

        // - Otherwise, the base discipline is selected as the identified discipline. This fallback is considered safe, as specializations only affect presentation attributes such as name, identifier or color. Falling back to the base discipline therefore does not result in a loss of critical information
        const baseDisciplineIds = new Set(disciplineCandidates.map(candidate => candidate.data.disciplineId));
        if (baseDisciplineIds.size === 1) {
            const baseDisciplineId = baseDisciplineIds.values().next().value;
            logger.debug(`Multiple discipline candidates remain, but they all belong to the same base discipline, resolving to ${baseDisciplineId}`);
            const baseDisciplineCandidate = disciplineCandidates.find(candidate => !isOverride(candidate.data)) || disciplineCandidates[0]; // If there is no base discipline candidate, which can happen if all discipline candidates are specializations of the same base discipline, just take any candidate, as they all belong to the same base discipline
            return this.resolveCandidate(candidates, "discipline", baseDisciplineCandidate);
        }

        // If there is no discipline candidate, which is a possible - but invalid - state of the range, the discipline is reported as empty. This can happen, for example, if the range uses a discipline that is not known to the ShootMaster server, which is possible as the range maintains its own discipline list that can be different from the one on the server.
        return candidates;
    }

    private resolveShooter(candidates: ResolvedPacketCandidates): ResolvedPacketCandidates {
        if (candidates.shooterCandidates.length === 1) {
            const candidate = candidates.shooterCandidates[0];
            return this.resolveCandidate(candidates, "shooter", candidate);
        }
        return candidates;
    }

    _transform(chunk: PacketCandidates, encoding: BufferEncoding, callback: TransformCallback): void {
        let candidates: ResolvedPacketCandidates = {
            ...chunk,
            discipline: null,
            startList: null,
            shooter: null
        };

        // First pass
        candidates = this.resolveStartList(candidates);
        candidates = this.resolveDiscipline(candidates);
        candidates = this.resolveShooter(candidates);

        // Second pass to catch any new resolutions that were made possible by the first pass
        candidates = this.resolveStartList(candidates);
        candidates = this.resolveDiscipline(candidates);
        candidates = this.resolveShooter(candidates);

        logger.debug(`After constraint solving, resolved discipline: ${candidates.discipline ? candidates.discipline.disciplineId : "none"}`);
        logger.debug(`After constraint solving, resolved start list: ${candidates.startList ? candidates.startList.id : "none"}`);
        logger.debug(`After constraint solving, resolved shooter: ${JSON.stringify(candidates.shooter)}`);
        logger.debug(`Remaining discipline candidates: ${candidates.disciplineCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        logger.debug(`Remaining start list candidates: ${candidates.startListCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        logger.debug(`Remaining shooter candidates: ${candidates.shooterCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);

        this.push(candidates);
        callback();
    }
}