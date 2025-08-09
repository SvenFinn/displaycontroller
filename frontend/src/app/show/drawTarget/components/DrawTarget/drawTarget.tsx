"use client";

import { DrawTargetOptions } from "dc-screens-types";
import Ranges from "./ranges";
import { Provider } from "react-redux";
import { store, useAppSelector } from "./ranges-store/store"
import { setRange } from "./ranges-store/rangesReducer";
import RangesEvents from "../../../components/ServerEvents/ranges"
import Header from "./header";
import { useEffect } from "react";
import styles from "./drawTarget.module.css";
import { FontSizeWrapper } from "@frontend/app/show/components/FontSizeWrapper";

export interface DrawTargetProps {
    options: DrawTargetOptions;
    onReady?: () => void;
}

export default function DrawTarget({ options, onReady }: DrawTargetProps): React.JSX.Element {
    return (
        <Provider store={store} >
            <DrawTargetContent options={options} onReady={onReady} />
        </Provider >
    )
}

function DrawTargetContent({ options, onReady }: DrawTargetProps): React.JSX.Element {
    console.log("DrawTargetContent rendered with options:", options);
    return (
        <FontSizeWrapper className={styles.drawTarget} >
            <RangesEvents action={setRange} ranges={options.ranges} />
            <Header />
            <Ranges options={options} />
            <IsReadyDrawTarget options={options} onReady={onReady} />
        </FontSizeWrapper >
    )
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