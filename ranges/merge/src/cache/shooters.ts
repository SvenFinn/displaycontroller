import { LocalClient } from "dc-db-local";
import { Shooter, isShooter, InternalShooter, isInternalShooterById, mergeMaps } from "dc-ranges-types";
export const shooters = new Map<number, Shooter>();

export async function updateShooters(localClient: LocalClient) {
    const newShooters = await localClient.cache.findMany({
        where: {
            type: "shooter",
        },
    });
    const shooterTempMap = new Map<number, Shooter>();
    for (const shooter of newShooters) {
        if (!isShooter(shooter.value)) {
            continue;
        }
        if (shooter.value.id === null) {
            continue;
        }
        shooterTempMap.set(shooter.value.id, shooter.value);
    }
    mergeMaps(shooters, shooterTempMap);
}

export function getShooter(shooter: InternalShooter | null): Shooter | null {
    if (shooter == null) { // Range is free
        return null;
    }
    if (isInternalShooterById(shooter)) {
        return shooters.get(shooter) ?? null;
    }
    return {
        id: null,
        firstName: shooter.firstName,
        lastName: shooter.lastName,
    }
}
