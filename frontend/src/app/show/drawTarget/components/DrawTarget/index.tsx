"use client";

import { DrawTargetOptions } from "dc-screens-types";
import Ranges from "./ranges";
import { Provider } from "react-redux";
import { store, useAppSelector } from "./ranges-store/store"
import { setRange } from "./ranges-store/rangesReducer";
import RangesEvents from "../../../components/ServerEvents/ranges"
import Header from "./header";
import { use, useEffect } from "react";

export interface DrawTargetProps {
    options: DrawTargetOptions;
    onReady?: () => void;
}

export default function DrawTarget({ options, onReady }: DrawTargetProps): React.JSX.Element {
    useEffect(() => {
        if (!onReady) return;
        const timeout = setTimeout(onReady, 750);
        return () => clearTimeout(timeout);
    }, [onReady]);

    return (
        <div style={{ height: "100%", fontSize: "100vmin", userSelect: "none" }}>
            <Provider store={store}>
                <RangesEvents action={setRange} ranges={options.ranges} />
                <Header />
                <Ranges options={options} />
            </Provider>
        </div>
    )
}

function DrawTargetContent({ options, onReady }: DrawTargetProps): React.JSX.Element {
    const loadedRangesCount = useAppSelector((state) => Object.keys(state.ranges).length);

    useEffect(() => {
        if (loadedRangesCount > new Set(options.ranges.filter((r) => r !== null)).size) {
            onReady?.();
        }
    }, [loadedRangesCount, options.ranges, onReady]);

    return (
        <div style={{ height: "100%", fontSize: "100vmin", userSelect: "none" }}>
            <Provider store={store}>
                <RangesEvents action={setRange} ranges={options.ranges} />
                <Header />
                <Ranges options={options} />
            </Provider>
        </div>
    )
}