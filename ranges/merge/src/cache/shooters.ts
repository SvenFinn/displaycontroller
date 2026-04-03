import { LocalClient } from "dc-db-local";
import { isShooter, InternalShooter, RangeShooter, Index } from "dc-ranges/types";

let shooters = new Map<Index, RangeShooter>();

export async function updateShooters(localClient: LocalClient) {
    const newShooters = await localClient.cache.findMany({
        where: {
            type: "shooter",
        },
    });
    const shooterTempMap = new Map<Index, RangeShooter>();
    for (const shooter of newShooters) {
        if (!isShooter(shooter.value)) {
            continue;
        }
        if (shooter.value.id === null) {
            continue;
        }
        shooterTempMap.set(shooter.value.id, {
            type: "occupied",
            id: shooter.value.id,
            firstName: shooter.value.firstName,
            lastName: shooter.value.lastName,
        });
    }

    shooters = shooterTempMap;
}

export function getShooter(shooter: InternalShooter | null): RangeShooter | null {
    if (shooter == null) { // Range is free
        return null;
    }
    if (shooter.type === "free") {
        return { type: "free" };
    }
    if (shooter.type == "byId") {
        return structuredClone(shooters.get(shooter.id) ?? null);
    }
    return {
        type: "occupied",
        id: null,
        firstName: shooter.firstName,
        lastName: shooter.lastName,
    }
}
