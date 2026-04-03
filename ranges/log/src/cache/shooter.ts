import { LocalClient } from "dc-db-local";
import { isShooter, InternalShooter, InternalShooterByName, Index } from "dc-ranges/types";

let shooterMap = new Map<Index, InternalShooterByName>();

export async function updateShooters(client: LocalClient) {
    const shooters = await client.cache.findMany({
        where: {
            type: "shooter"
        }
    });
    const shooterTempMap = new Map<Index, InternalShooterByName>();
    for (const shooter of shooters) {
        if (!isShooter(shooter.value)) {
            continue;
        }
        if (shooter.value.id === null) {
            continue;
        }
        shooterTempMap.set(shooter.value.id, { type: "byName", firstName: shooter.value.firstName, lastName: shooter.value.lastName });
    }

    shooterMap = shooterTempMap;
}

export function isSameShooter(shooterOne: InternalShooter | null, shooterTwo: InternalShooter | null): boolean {
    if (shooterOne === null || shooterTwo === null) return shooterOne === null && shooterTwo === null;
    if (shooterOne.type === "free" || shooterTwo.type === "free") return shooterOne.type === shooterTwo.type;

    if (shooterOne.type === "byId" && shooterTwo.type === "byId") {
        return shooterOne.id === shooterTwo.id;
    }

    const shooterOneByName = shooterOne.type === "byId" ? shooterMap.get(shooterOne.id) : shooterOne;
    const shooterTwoByName = shooterTwo.type === "byId" ? shooterMap.get(shooterTwo.id) : shooterTwo;
    if (!shooterOneByName || !shooterTwoByName) {
        return false;
    }

    return shooterOneByName.firstName === shooterTwoByName.firstName && shooterOneByName.lastName === shooterTwoByName.lastName;
}