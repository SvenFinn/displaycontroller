import { DrawHit } from "./hit"
import { Hits, Range, Round, UnsignedNumber } from "dc-ranges-types";
import TargetCircle from "./targetCircle";
import { memo } from "react";
import { compareJSON } from "..";

export const DrawHits = memo(
    ({ round, hits, gauge, strokeWidth }: { round: Round | null, hits: Hits, gauge: UnsignedNumber, strokeWidth: number }): React.JSX.Element => {
        if (!round) return <></>
        if (round.mode.mode == "fullHidden") return <></>;

        let selectedHits = hits;
        const maxHitId = Math.max(...hits.map(h => h.id));

        if (maxHitId < round.maxHits) {
            const latestSeriesId =
                Math.floor((maxHitId - 1) / round.hitsPerView);

            selectedHits = hits.filter(
                hit =>
                    Math.floor((hit.id - 1) / round.hitsPerView) ===
                    latestSeriesId
            );
        }

        return (
            <g>
                {selectedHits.map((hit, index) => (
                    <DrawHit key={index} layout={round?.layout || null} hit={hit} gauge={gauge} isLatest={index == selectedHits.length - 1} />
                ))}
                {round.mode.mode == "circle" ? <TargetCircle hits={selectedHits} gauge={gauge} strokeWidth={strokeWidth} /> : <></>}
            </g>
        )
    }, compareJSON);