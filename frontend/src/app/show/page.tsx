import ServerState from "./components/ServerEvents/serverState"
import Clock from "./components/Clock"
import Logo from "./components/Logo"
import FullscreenButton from "./components/Fullscreen";
import styles from "./show.module.css";
import ShowScreens from "./components/Screens";
import { Metadata } from "next";
import Background from "./components/Background";

export default function Show(): React.JSX.Element {
    return (
        <div className={styles.show}>
            <Background />
            <ShowScreens />
            <FullscreenButton />
            <Clock />
            <Logo />
            <ServerState />
        </div >
    )
}

export const metadata: Metadata = {
    title: "Displaycontroller - Show",
    description: "",
};