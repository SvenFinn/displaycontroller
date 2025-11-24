"use client";

import { DrawTargetOptions } from "dc-screens-types";
import Ranges from "./ranges";
import { Provider } from "react-redux";
import { store, useAppSelector } from "./ranges-store/store"
import { setRange } from "./ranges-store/rangesReducer";
import Header from "./header";
import { useEffect } from "react";
import styles from "./drawTarget.module.css";
import { SizeWrapper } from "@frontend/app/show/components/SizeWrapper";
import RangesProvider, { useRangesCallback } from "@frontend/app/show/components/ServerEvents/ranges";

export interface DrawTargetProps {
    options: DrawTargetOptions;
    onReady?: () => void;
}

export default function DrawTarget({ options, onReady }: DrawTargetProps): React.JSX.Element {
    console.log("Render DrawTarget with options:", options);
    return (
        <RangesProvider ranges={options.ranges} >
            <Provider store={store} >
                <SizeWrapper className={styles.drawTarget} >
                    <DrawTargetContent options={options} onReady={onReady} />
                </SizeWrapper >
            </Provider >
        </RangesProvider >
    )
}

function DrawTargetContent({ options, onReady }: DrawTargetProps): React.JSX.Element {
    useRangesCallback(setRange);
    return (
        <>
            <Header />
            <Ranges options={options} />
            <IsReadyDrawTarget options={options} onReady={onReady} />
        </>
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