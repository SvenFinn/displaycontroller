import ShowScreens from "./components/Screens";
import Show from "./components/Show";
import PlayBackButtons from "./components/PlaybackButtons";
import { Metadata } from "next";

export default function Page(): React.JSX.Element {
    return (
        <Show>
            <ShowScreens />
            <PlayBackButtons />
        </Show>
    )
}

export const metadata: Metadata = {
    title: "Displaycontroller - Show",
    description: "Cycle through screens in a show",
};