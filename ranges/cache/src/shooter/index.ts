import { SmdbClient } from "dc-db-smdb";
import { Shooter } from "@shared/ranges/shooter"

export async function getShooterCache(smdbClient: SmdbClient): Promise<Array<Shooter>> {
    const shooters = await smdbClient.shooter.findMany({
        where: {
            id: {
                gt: 0 // Special case, because Meyton uses 0 as a "empty" value
            }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true
        }
    });
    return shooters.map(shooter => {
        return {
            id: Number(shooter.id),
            firstName: shooter.firstName,
            lastName: shooter.lastName
        }
    });
}