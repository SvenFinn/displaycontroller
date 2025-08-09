"use client";

import { CpcViewOptions } from "dc-screens-types";
import { store, useAppSelector } from "./ranges-store/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import RangesEvents from "../../../components/ServerEvents/ranges";
import { setRange } from "./ranges-store/rangesReducer";
import Ranges from "./ranges";
import { CpcHeader } from "./header";

interface CpcViewProps {
    options: CpcViewOptions,
    onReady?: () => void;
}

export default function CpcView({ options, onReady }: CpcViewProps): React.JSX.Element {
    return (
        <Provider store={store}>
            <CpcViewContent options={options} onReady={onReady} />
        </Provider>
    );
}

function CpcViewContent({ options, onReady }: CpcViewProps): React.JSX.Element {
    const loadedRangesCount = useAppSelector((state) => Object.keys(state.ranges).length);
    useEffect(() => {
        if (loadedRangesCount > new Set(options.ranges.filter((r) => r !== null)).size) {
            onReady?.();
        }
    }, [loadedRangesCount, options.ranges, onReady]
    );
    return (
        <>
            <RangesEvents action={setRange} ranges={options.ranges} />
            <CpcHeader />
            <Ranges options={options} />
        </>
    );
}