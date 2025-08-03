import { Screens } from ".";
import { CustomURLDbScreen } from "dc-screens-types";

export default async function customURL(screen: CustomURLDbScreen): Promise<Screens> {
    return [
        {
            available: true,
            id: screen.id,
            subId: 0,
            type: "customURL",
            options: screen.options,
            duration: screen.duration
        }
    ]
}
