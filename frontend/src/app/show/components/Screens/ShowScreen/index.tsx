"use client";

import { ScreenAvailable } from "@shared/screens";
import DrawTarget from "../../../drawTarget/components/DrawTarget";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import { screenReady } from "../store/screensReducer";
import styles from "./showScreen.module.css";
import ImageViewer from "../../../imageViewer/components/ImageViewer";
import Evaluation from "../../../evaluation/components/Evaluation";
import SystemMessage from "../../../systemMessage";
import CustomURL from "@frontend/app/show/customURL/components/CustomURL";

interface ShowScreenProps {
    id: number
}

export default function ShowScreen({ id }: ShowScreenProps): React.JSX.Element {
    const [visible, setVisible] = useState<boolean>(false);
    const screen = useAppSelector((state) => state.screens[id]);
    const dispatch = useAppDispatch();

    if (!screen) {
        if (visible) {
            setVisible(false);
        }
        return <></>;
    }

    function handleReady() {
        setVisible(true);
        dispatch(screenReady(id));
    }

    return (
        <div className={styles.showScreen} style={{ visibility: visible ? "visible" : "hidden" }} id={`screen-${id}`}>
            {getScreenComponent(screen, handleReady)}
        </div>
    );

}


function getScreenComponent(screen: ScreenAvailable, setIsReady: () => void): React.JSX.Element {
    switch (screen.preset) {
        case "drawTarget":
            return <DrawTarget options={screen.options} onReady={setIsReady} />;
        case "imageViewer":
            return <ImageViewer options={screen.options} onReady={setIsReady} />;
        case "evaluation":
            return <Evaluation options={screen.options} onReady={setIsReady} />;
        case "systemMessage":
            return <SystemMessage options={screen.options} onReady={setIsReady} />;
        case "customURL":
            return <CustomURL options={screen.options} onReady={setIsReady} />;
        default:
            setTimeout(setIsReady, 500);
            return <h1>Unknown preset: {screen.preset}</h1>;
    }
}