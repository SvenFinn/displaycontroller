"use client";

import { CpcViewOptions } from "dc-screens-types";
import { store } from "./ranges-store/store";
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
    useEffect(() => {
        if (!onReady) return;
        const timeout = setTimeout(onReady, 750);
        return () => clearTimeout(timeout);
    }, [onReady]);

    return (
        <Provider store={store}>
            <RangesEvents action={setRange} ranges={options.ranges} />
            <CpcHeader />
            <Ranges options={options} />
        </Provider>
    );
}