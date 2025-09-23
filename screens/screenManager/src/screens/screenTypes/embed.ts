import { Screens } from ".";
import { EmbedDbScreen } from "dc-screens-types";

export default async function embed(screen: EmbedDbScreen): Promise<Screens> {
    return [
        {
            available: true,
            id: screen.id,
            subId: 0,
            type: "embed",
            options: screen.options,
            duration: screen.duration
        }
    ]
}
