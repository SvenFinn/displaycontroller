"use client";

import { ScreenAvailable } from "dc-screens-types";
import DrawTarget from "../../../drawTarget/components/DrawTarget";
import { useCallback, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import { screenReady } from "../store/screensReducer";
import styles from "./showScreen.module.css";
import ImageViewer from "../../../imageViewer/components/ImageViewer";
import SystemMessage from "../../../systemMessage";
import Embed from "@frontend/app/show/embed/components/Embed";
import CpcView from "@frontend/app/show/cpcView/components/CpcView";
import ScreenCastViewer from "@frontend/app/show/screenCast/components/Viewer";
import Evaluation from "@frontend/app/show/evaluation/components/Evaluation";

interface ShowScreenProps {
    id: number
}

export default function ShowScreen({ id }: ShowScreenProps): React.JSX.Element {
    const [visible, setVisible] = useState<boolean>(false);
    const screen = useAppSelector((state) => state.screens[id]);
    const dispatch = useAppDispatch();

    const handleReady = useCallback(() => {
        setVisible(true);
        dispatch(screenReady(id));
    }, [dispatch, id]);

    const screenElement = useMemo(() => {
        if (!screen) {
            return <></>;
        }
        return getScreenComponent(screen, handleReady);
    }, [screen, handleReady]);


    if (!screen) {
        if (visible) {
            setVisible(false);
        }
        return <></>;
    }


    return (
        <div className={styles.showScreen} style={{ visibility: visible ? "visible" : "hidden" }} id={`screen-${id}`}>
            {screenElement}
        </div>
    );

}

export function getScreenComponent(screen: ScreenAvailable, setIsReady: () => void): React.JSX.Element {
    switch (screen.type) {
        case "drawTarget":
            return <DrawTarget options={screen.options} onReady={setIsReady} />;
        case "imageViewer":
            return <ImageViewer options={screen.options} onReady={setIsReady} />;
        case "evaluation":
            return <Evaluation options={screen.options} onReady={setIsReady} />;
        case "systemMessage":
            return <SystemMessage options={screen.options} onReady={setIsReady} />;
        case "embed":
            return <Embed options={screen.options} onReady={setIsReady} />;
        case "cpcView":
            return <CpcView options={screen.options} onReady={setIsReady} />;
        case "screenCast":
            return <ScreenCastViewer onReady={setIsReady} />;
        default:
            setTimeout(setIsReady, 500);
            return <h1>Unknown type: {String((screen as any)?.type)}</h1>;
    }
}