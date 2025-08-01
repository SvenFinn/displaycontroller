"use client";

import { useDispatch } from "react-redux";
import ServerEvents from "./base";
import { isScreen, Screen } from "@shared/screens";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";

interface ScreenEventsProps {
    action: ActionCreatorWithPayload<Screen>;
}

export default function ScreenEvents({ action }: ScreenEventsProps) {
    const dispatch = useDispatch();
    const [host, setHost] = useState<string>("");

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (host === "") {
        return <></>;
    }


    const path = new URL(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/screens/current/sse`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function screensAction(data: any) {
        if (!isScreen(data)) {
            return;
        }
        dispatch(action(data));
    }

    return (
        <ServerEvents path={path} canonicalName="Screens" action={screensAction} />
    )
}