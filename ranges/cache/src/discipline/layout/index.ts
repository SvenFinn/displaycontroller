import { SmdbClient } from "dc-db-smdb";
import { DisciplineLayout, DisciplineLayoutRings } from "@shared/ranges/discipline/layout";
import { getCustomLayout } from "./custom";

export async function getLayout(smdbClient: SmdbClient, layoutId: number): Promise<DisciplineLayout | undefined> {
    const layoutDb = await smdbClient.layout.findUnique({
        where: {
            id: layoutId
        },
        select: {
            funcId: true
        }
    });
    if (!layoutDb) {
        return undefined;
    }
    if (layoutDb.funcId === 12) {
        return await getCustomLayout(layoutId);
    } else {
        return await getRingsLayout(smdbClient, layoutId);
    }
}

async function getRingsLayout(smdbClient: SmdbClient, layoutId: number): Promise<DisciplineLayoutRings | undefined> {
    const layoutDb = await smdbClient.layout.findUnique({
        where: {
            id: layoutId
        },
        select: {
            innerTen: true,
            diameter: true,
            rings: true
        }
    });
    if (!layoutDb) {
        return undefined;
    }
    const layout: DisciplineLayoutRings = {
        mode: "rings",
        rings: layoutDb.rings.map(ring => {
            return {
                value: ring.value / 10,
                diameter: ring.diameter / 10,
                colored: ring.diameter <= layoutDb.diameter
            }
        })
    };
    if (layoutDb.innerTen > 0) {
        const maxValue = Math.max(...layout.rings.map(ring => ring.value));
        layout.rings.push({
            value: maxValue,
            diameter: layoutDb.innerTen / 10,
            colored: layoutDb.innerTen <= layoutDb.diameter
        });
    }
    layout.rings = layout.rings.sort((a, b) => a.diameter - b.diameter);
    return layout;
}