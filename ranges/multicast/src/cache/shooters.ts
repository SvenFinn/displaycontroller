import { InternalShooter, isShooter } from "dc-ranges-types";
import { Matcher } from "../types";
import { LocalClient } from "dc-db-local";
import { createMatcher } from "./matcher";

export let potentialShooters: Matcher<InternalShooter> = createMatcher(new Map());

export async function updatePotentialShooters(localClient: LocalClient) {
    const shooters: Map<string, InternalShooter> = new Map();

    const shooterData = await localClient.cache.findMany({
        where: {
            type: "shooter"
        }
    });
    for (const shooterDb of shooterData) {
        if (!shooterDb.value) {
            continue;
        }
        const shooter = shooterDb.value;
        if (!isShooter(shooter) || !shooter.id) {
            continue;
        }
        const name = `${shooter.lastName}, ${shooter.firstName}`;
        const existing = shooters.get(name);
        if (!existing) {
            shooters.set(name, shooter.id);
            continue;
        }
        if (typeof existing === "number") {
            shooters.set(name, {
                firstName: shooter.firstName,
                lastName: shooter.lastName
            });
        }
    }

    const normalizedShooters = new Map<string, InternalShooter[]>();
    for (const [name, shooter] of shooters.entries()) {
        normalizedShooters.set(name, [shooter]);
    }

    potentialShooters = createMatcher(normalizedShooters);
}