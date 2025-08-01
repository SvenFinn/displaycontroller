import { Screens } from ".";
import { DrawTargetDbScreen } from "@shared/screens/drawTarget";

export default async function drawTarget(screen: DrawTargetDbScreen): Promise<Screens> {
    return [
        {
            available: true,
            id: screen.id,
            subId: 0,
            preset: "drawTarget",
            options: screen.options,
            duration: screen.duration
        }
    ]
}
