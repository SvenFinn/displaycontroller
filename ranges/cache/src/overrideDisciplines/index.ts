import { SmdbClient } from "dc-db-smdb";
import { OverrideDiscipline } from "dc-ranges-types"

export async function getOverrideDisciplines(smdbClient: SmdbClient): Promise<Array<OverrideDiscipline>> {
    const overrideDisciplinesDb = await smdbClient.priceShooting.findMany({
        where: {
            id: {
                gt: 0 // Special case, because Meyton uses 0 as a "empty" value
            },
            discipline: {
                active: true
            }
        },
        select: {
            id: true,
            listId: true,
            disciplineId: true,
            color: true,
            name: true
        }
    });
    return overrideDisciplinesDb.map(overrideDiscipline => {
        return {
            id: overrideDiscipline.id,
            disciplineId: overrideDiscipline.disciplineId,
            name: overrideDiscipline.name,
            color: overrideDiscipline.color,
            startListId: overrideDiscipline.listId
        }
    });
}

