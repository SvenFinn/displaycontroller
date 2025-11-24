"use client";

import { CpcViewOptions } from "dc-screens-types";
import { store, useAppSelector } from "./ranges-store/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { setRange } from "./ranges-store/rangesReducer";
import Ranges from "./ranges";
import { CpcHeader } from "./header";
import RangesProvider, { useRangesCallback } from "@frontend/app/show/components/ServerEvents/ranges";

interface CpcViewProps {
    options: CpcViewOptions,
    onReady?: () => void;
}

export default function CpcView({ options, onReady }: CpcViewProps): React.JSX.Element {
    return (
        <RangesProvider ranges={options.ranges}>
            <Provider store={store}>
                <CpcViewContent options={options} onReady={onReady} />
            </Provider>
        </RangesProvider>
    );
}

function CpcViewContent({ options, onReady }: CpcViewProps): React.JSX.Element {
    useRangesCallback(setRange);
    return (
        <>
            <CpcHeader />
            <Ranges options={options} />
            <CpcViewIsReady options={options} onReady={onReady} />
        </>
    );
}

function CpcViewIsReady({ options, onReady }: CpcViewProps): React.JSX.Element {
    const loadedRangesCount = useAppSelector((state) => Object.keys(state.ranges).length);

    useEffect(() => {
        if (loadedRangesCount >= new Set(options.ranges.filter((r) => r !== null)).size) {
            onReady?.();
        }
    }, [loadedRangesCount, options.ranges, onReady]);
    return <></>;
}