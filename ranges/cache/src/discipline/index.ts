import { Discipline, Round, Rounds, Mode, Zoom } from "dc-ranges-types";
import { SmdbClient } from "dc-db-smdb";
import { getLayout } from "./layout";

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
        rounds: await getRounds(smdbClient, disciplineId)
    };
}

async function getRounds(smdbClient: SmdbClient, disciplineId: number): Promise<Rounds> {
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
    const rounds: Rounds = [];
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

async function getRound(smdbClient: SmdbClient, disciplineId: number, roundId: number): Promise<Round | undefined> {
    const round = await smdbClient.round.findUnique({
        where: {
            disciplineId_id: {
                id: roundId,
                disciplineId: disciplineId
            }
        },
        select: {
            hitsPerSum: true,
            hitsPerView: true,
            maxHits: true,
            mode: true,
            zoom: true,
            layoutId: true,
            name: true
        },
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
        layout: await getLayout(smdbClient, round.layoutId),
        mode: getMode(round.mode),
        zoom: getZoom(round.zoom)
    }
}

function getMode(mode: number): Mode {
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
        case 13: // Dart 501
            return { mode: "target", decimals: 0, value: 501, exact: true };
        case 14: // decimal * integer part
            return { mode: "integerDecimal" };
        default:
            throw new Error("Invalid mode");
    }
}

function getZoom(zoom: number): Zoom {
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
