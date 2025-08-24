"use client";

import { useAppSelector } from "../../store/store";
import styles from "./screenList.module.css";
import dynamic from "next/dynamic";
import { ScreenListEntry } from "./entry";

const NewScreen = dynamic(() => import('./new'), { ssr: false })

export function ScreenList() {
    const screens = useAppSelector(state => state.screens.screens);

    return (
        <div className={styles.screenList}>
            {
                screens.map(screen => (
                    <ScreenListEntry id={screen.id} key={screen.id} />
                ))
            }
            <NewScreen />
        </div >
    );
}