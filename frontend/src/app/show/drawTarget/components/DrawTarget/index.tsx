"use client";

import { DrawTargetOptions } from "dc-screens-types";
import Ranges from "./ranges";
import { Provider } from "react-redux";
import { store } from "./ranges-store/store"
import { setRange } from "./ranges-store/rangesReducer";
import RangesEvents from "../../../components/ServerEvents/ranges"
import Header from "./header";
import { useEffect } from "react";

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