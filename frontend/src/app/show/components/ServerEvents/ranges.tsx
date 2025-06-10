"use client";

import ServerEvents from "./base";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { isRange, Range } from "@shared/ranges";
import { useAppDispatch } from "../../drawTarget/components/DrawTarget/ranges-store/store";
import { useEffect, useState } from "react";

interface RangeEventsProps {
    ranges: Array<number>;
    action: ActionCreatorWithPayload<Range>;
}

export default function RangeEvents({ action, ranges }: RangeEventsProps): React.JSX.Element {
    const dispatch = useAppDispatch();
    const [host, setHost] = useState<string>("");

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (host === "") {
        return <></>;
    }

    ranges = ranges.filter((range) => typeof range === "number" && !isNaN(range));

    const path = new URL(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/ranges/sse`);
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