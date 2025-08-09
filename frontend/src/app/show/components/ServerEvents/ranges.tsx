"use client";

import ServerEvents from "./base";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { isRange, Range } from "dc-ranges-types";
import { useAppDispatch } from "../../drawTarget/components/DrawTarget/ranges-store/store";
import { useEffect, useState } from "react";
import { useHost } from "@frontend/app/hooks/useHost";

interface RangeEventsProps {
    ranges: Array<number | null>;
    action: ActionCreatorWithPayload<Range>;
}

export default function RangeEvents({ action, ranges }: RangeEventsProps): React.JSX.Element {
    const dispatch = useAppDispatch();
    const host = useHost();


    ranges = ranges.filter((range) => typeof range === "number" && !isNaN(range));

    if (!host) {
        return <></>;
    }

    const path = new URL(`${host}/api/ranges/sse`);
    path.searchParams.append("ranges", JSON.stringify(ranges));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function actionCallback(data: any) {
        if (!isRange(data)) {
            return;
        }
        dispatch(action(data));
    }

    return (
        <ServerEvents path={path} canonicalName="Ranges" action={actionCallback} />
    )
}