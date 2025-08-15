"use client";

import LocalScreen from "@frontend/app/show/components/LocalScreen";
import { useAppDispatch, useAppSelector } from "../../store/store";
import styles from "./screenList.module.css";
import { FaChevronDown, FaChevronUp, FaXmark } from "react-icons/fa6";
import { deleteScreen, moveScreenDown, moveScreenUp, selectScreen } from "../../store/screensReducer";
import dynamic from "next/dynamic";

const NewScreen = dynamic(() => import('./new'), { ssr: false })

export function ScreenList() {
    const screens = useAppSelector(state => state.screens.screens);
    const currentScreenId = useAppSelector(state => state.screens.currentScreenId);
    const dispatch = useAppDispatch();


    return (
        <div className={styles.screenList}>
            {
                screens.map(screen => (
                    <div key={screen.id} className={`${styles.screenListEntry} ${currentScreenId === screen.id ? styles.active : ""}`} onClick={() => dispatch(selectScreen(screen.id))}>
                        <FaChevronUp className={styles.moveUp} onClick={() => dispatch(moveScreenUp(screen.id))} />
                        <FaChevronDown className={styles.moveDown} onClick={() => dispatch(moveScreenDown(screen.id))} />
                        <FaXmark className={styles.delete} onClick={() => dispatch(deleteScreen(screen.id))} />
                        <LocalScreen screen={screen} key={screen.id} />
                    </div>
                ))
            }
            <NewScreen />
        </div >
    );
}