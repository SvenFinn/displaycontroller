import { isInternalShooterById, isInternalShooterByName, InternalShooter, InternalShooterById, InternalShooterByName } from "@shared/ranges/internal";
import { LocalClient } from "dc-db-local";
import { isShooter } from "@shared/ranges/shooter";

export const shooterMap = new Map<InternalShooterById, InternalShooterByName>();

export async function updateShooters(client: LocalClient) {
    const shooters = await client.cache.findMany({
        where: {
            type: "shooter"
        }
    });
    shooterMap.clear();
    for (const shooter of shooters) {
        if (!isShooter(shooter.value)) {
            continue;
        }
        if (shooter.value.id === null) {
            continue;
        }
        shooterMap.set(shooter.value.id, { firstName: shooter.value.firstName, lastName: shooter.value.lastName });
    }
}

export function isSameShooter(shooterOne: InternalShooter | null, shooterTwo: InternalShooter | null): boolean {
    if (shooterOne === null && shooterTwo === null) {
        return true;
    } else if (shooterOne === null || shooterTwo === null) {
        return false;
    }
    const isShooterOneById = isInternalShooterById(shooterOne);
    const isShooterTwoById = isInternalShooterById(shooterTwo);
    if (isShooterOneById && isShooterTwoById) {
        return shooterOne === shooterTwo;
    } else if (isInternalShooterByName(shooterOne) && isInternalShooterByName(shooterTwo)) {
        return shooterOne.firstName === shooterTwo.firstName && shooterOne.lastName === shooterTwo.lastName;
    } else if (isShooterOneById && isInternalShooterByName(shooterTwo)) {
        const shooter = shooterMap.get(shooterOne);
        if (!shooter) {
            return false;
        }
        return shooter.firstName === shooterTwo.firstName && shooter.lastName === shooterTwo.lastName;
    } else if (isShooterTwoById && isInternalShooterByName(shooterOne)) {
        const shooter = shooterMap.get(shooterTwo);
        if (!shooter) {
            return false;
        }
        return shooter.firstName === shooterOne.firstName && shooter.lastName === shooterOne.lastName;
    }
    return false;
}