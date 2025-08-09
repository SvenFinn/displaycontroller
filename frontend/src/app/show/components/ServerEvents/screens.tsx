"use client";

import { useDispatch } from "react-redux";
import ServerEvents from "./base";
import { isScreen, Screen } from "dc-screens-types";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { useHost } from "@frontend/app/hooks/useHost";

interface ScreenEventsProps {
    action: ActionCreatorWithPayload<Screen>;
}

export default function ScreenEvents({ action }: ScreenEventsProps) {
    const dispatch = useDispatch();
    const host = useHost();

    if (!host) {
        return <></>;
    }


    const path = `${host}/api/screens/current/sse`;

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