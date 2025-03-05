import dotenv from "dotenv";
import { Discipline } from "@shared/ranges/discipline";
import { SmdbClient } from "dc-db-smdb";
import { DisciplineRound, DisciplineRounds } from "@shared/ranges/discipline/round";
import { DisciplineLayout, DisciplineLayouts } from "@shared/ranges/discipline/layout";
import { DisciplineRoundMode } from "@shared/ranges/discipline/round/mode";
import { DisciplineRoundZoom } from "@shared/ranges/discipline/round/zoom";

dotenv.config();

export async function getDisciplineCache(smdbClient: SmdbClient): Promise<Array<Discipline>> {
    const disciplinesDb = await smdbClient.discipline.findMany({
        where: {
            active: true
        },
        select: {
            id: true
        }
    });
    const disciplines = await Promise.all(disciplinesDb.map(async discipline => {
        return await getDiscipline(smdbClient, discipline.id);
    }));
    return disciplines.filter(discipline => discipline !== undefined) as Discipline[];
}



async function getDiscipline(smdbClient: SmdbClient, disciplineId: number): Promise<Discipline | undefined> {
    const discipline = await smdbClient.discipline.findUnique({
        where: {
            id: disciplineId,
            active: true
        },
        select: {
            name: true,
            gauge: true
        }
    });
    if (!discipline) {
        return undefined;
    }
    return {
        id: disciplineId,
        name: discipline.name,
        gauge: parseFloat((discipline.gauge / 100).toFixed(2)),
        color: `#${process.env.TARGET_DEFAULT_COLOR}`,
        layouts: await getLayouts(smdbClient, disciplineId),
        rounds: await getRounds(smdbClient, disciplineId)
    };
}

async function getRounds(smdbClient: SmdbClient, disciplineId: number): Promise<DisciplineRounds> {
    const roundsDb = await smdbClient.discipline.findUnique({
        where: {
            id: disciplineId
        },
        include: {
            rounds: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!roundsDb) {
        return [];
    }
    const roundIds = roundsDb.rounds.map(round => round.id);
    const rounds: DisciplineRounds = [];
    for (const roundId of roundIds) {
        const round = await getRound(smdbClient, disciplineId, roundId);
        if (round) {
            rounds[roundId] = round;
        }
    }
    for (let i = 0; i < rounds.length; i++) {
        if (typeof rounds[i] === 'undefined') {
            rounds[i] = null;
        }
    }
    return rounds;
}

async function getRound(smdbClient: SmdbClient, disciplineId: number, roundId: number): Promise<DisciplineRound | undefined> {
    const round = await smdbClient.rounds.findUnique({
        where: {
            id: roundId,
            disciplineId: disciplineId
        },
        select: {
            hitsPerSum: true,
            hitsPerView: true,
            maxHits: true,
            mode: true,
            zoom: true,
            targetLayoutId: true,
            name: true
        }
    });
    if (!round) {
        return undefined;
    }
    return {
        id: roundId,
        counts: roundId % 2 == 1,
        name: round.name,
        maxHits: round.maxHits,
        hitsPerSum: round.hitsPerSum,
        hitsPerView: round.hitsPerView,
        layoutId: round.targetLayoutId,
        mode: getMode(round.mode),
        zoom: getZoom(round.zoom)
    }
}

function getMode(mode: number): DisciplineRoundMode {
    switch (mode) {
        case 1:
            return { mode: "rings", decimals: 1 };
        case 2:
            return { mode: "rings", decimals: 0 };
        case 3:
            return { mode: "divider", decimals: 0 };
        case 4:
            return { mode: "circle" };
        case 5:
            return { mode: "fullHidden" };
        case 6:
            return { mode: "hundred" };
        case 7:
            return { mode: "ringsDiv", decimals: 1 };
        case 8:
            return { mode: "ringsDiv", decimals: 0 };
        case 9:
            return { mode: "divider", decimals: 1 };
        case 10:
            return { mode: "hidden" };
        case 11:
            return { mode: "divider", decimals: 2 };
        case 12:
            return { mode: "decimal" };
        default:
            throw new Error("Invalid mode");
    }
}

function getZoom(zoom: number): DisciplineRoundZoom {
    switch (zoom) {
        case 0:
            return { mode: "none" };
        case 1:
            return { mode: "auto" };
        case 2:
            return { mode: "fixed", value: 8 };
        case 3:
            return { mode: "fixed", value: 6 };
        case 4:
            return { mode: "fixed", value: 4 };
        default:
            throw new Error("Invalid zoom");
    }
}

async function getLayouts(smdbClient: SmdbClient, disciplineId: number): Promise<DisciplineLayouts> {
    const layoutDatabase = await smdbClient.discipline.findUnique({
        where: {
            id: disciplineId
        },
        include: {
            rounds: {
                select: {
                    targetLayoutId: true
                }
            }
        }
    });
    if (!layoutDatabase) {
        return [];
    }
    const layoutIds = layoutDatabase.rounds.map(round => round.targetLayoutId).filter((value, index, self) => self.indexOf(value) === index);
    const layouts: DisciplineLayouts = {};
    for (let i = 0; i < layoutIds.length; i++) {
        const layout = await getLayout(smdbClient, layoutIds[i]);
        if (layout) {
            layouts[layoutIds[i]] = layout
        }
    }
    return layouts;
}

async function getLayout(smdbClient: SmdbClient, layoutId: number): Promise<DisciplineLayout | undefined> {
    const layout = await smdbClient.targetLayout.findUnique({
        where: {
            id: layoutId
        },
        select: {
            innerTen: true,
            holeSize: true,
            rings: true
        }
    });
    if (!layout) {
        return undefined;
    }
    const rings: DisciplineLayout = layout.rings.map(ring => {
        return {
            value: ring.value / 10,
            diameter: ring.diameter / 10,
            colored: ring.diameter <= layout.holeSize
        }
    });
    if (layout.innerTen > 0) {
        const maxValue = Math.max(...rings.map(ring => ring.value));
        rings.push({
            value: maxValue,
            diameter: layout.innerTen / 10,
            colored: layout.innerTen <= layout.holeSize
        });
    }

    return rings.sort((a, b) => a.diameter - b.diameter);
}