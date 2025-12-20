"use client";

import { DrawTargetOptions } from "dc-screens-types";
import Ranges from "./ranges";
import { Provider } from "react-redux";
import { store, useAppSelector } from "./ranges-store/store"
import { setRange } from "./ranges-store/rangesReducer";
import Header from "./header";
import { useEffect } from "react";
import styles from "./drawTarget.module.css";
import RangesProvider, { useRangesCallback } from "@frontend/app/show/components/ServerEvents/ranges";
import { HeightAsFontSize } from "@frontend/app/components/base/BoundingBoxCss";

export interface DrawTargetProps {
    options: DrawTargetOptions;
    onReady?: () => void;
}

export default function DrawTarget({ options, onReady }: DrawTargetProps): React.JSX.Element {
    return (
        <RangesProvider ranges={options.ranges} >
            <Provider store={store} >
                <DrawTargetContent options={options} onReady={onReady} />
            </Provider >
        </RangesProvider >
    )
}

function DrawTargetContent({ options, onReady }: DrawTargetProps): React.JSX.Element {
    useRangesCallback(setRange);
    return (
        <div className={styles.drawTarget}>
            <Header />
            <Ranges options={options} />
            <IsReadyDrawTarget options={options} onReady={onReady} />
        </div>
    );
}

function IsReadyDrawTarget({ options, onReady }: DrawTargetProps): React.JSX.Element {
    const loadedRangesCount = useAppSelector((state) => Object.keys(state.ranges).length);

    useEffect(() => {
        if (loadedRangesCount >= new Set(options.ranges.filter((r) => r !== null)).size) {
            onReady?.();
        }
    }, [loadedRangesCount, options.ranges]);
    return (
        <></>
    );
}