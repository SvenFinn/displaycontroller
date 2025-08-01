import { Screens } from ".";
import { CpcViewDbScreen } from "dc-screens-types";

export default async function cpcView(screen: CpcViewDbScreen): Promise<Screens> {
    return [
        {
            available: true,
            id: screen.id,
            subId: 0,
            preset: "cpcView",
            options: screen.options,
            duration: screen.duration
        }
    ]
}
