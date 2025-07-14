import { SystemMessageDbScreen } from "dc-screens-types";
import { Screens } from ".";

export default async function systemMessage(screen: SystemMessageDbScreen): Promise<Screens> {
    return [
        {
            available: true,
            id: screen.id,
            subId: 0,
            preset: "systemMessage",
            options: screen.options,
            duration: 15000
        }
    ]
}
