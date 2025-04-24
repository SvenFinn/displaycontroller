import { LocalClient } from "dc-db-local";
import { isShooter } from "@shared/ranges/shooter"
import { InternalShooter } from "@shared/ranges/internal"
import { mergeMaps } from "@shared/ranges/cache";

const matchShooter = new Map<string, InternalShooter>();

export async function updateShooters(client: LocalClient) {
    const shooters = await client.cache.findMany({
        where: {
            type: "shooter"
        }
    });
    const shooterTempMap = new Map<string, InternalShooter>();
    for (const shooter of shooters) {
        if (!isShooter(shooter.value)) {
            continue;
        }
        if (!shooter.value.id) {
            continue;
        }
        if (shooterTempMap.has(`${shooter.value.lastName}, ${shooter.value.firstName}`)) {
            shooterTempMap.set(`${shooter.value.lastName}, ${shooter.value.firstName}`, {
                firstName: shooter.value.firstName,
                lastName: shooter.value.lastName
            });
        } else {
            shooterTempMap.set(`${shooter.value.lastName}, ${shooter.value.firstName}`, shooter.value.id);
        }
    }
    mergeMaps(matchShooter, shooterTempMap);
}

export function getShooters(message: string): InternalShooter | null {
    const names = Array.from(matchShooter.keys()).sort((a, b) => b.length - a.length);
    for (const name of names) {
        if (message.includes(name)) {
            return matchShooter.get(name) || null;
        }
    }
    return null;
}

