"use client";


import { Provider } from "react-redux";
import ShowScreen from "./ShowScreen";
import { nextScreen } from "./store/screensReducer";
import { store } from "./store/store";
import ScreensProvider, { useScreensCallback } from "../ServerEvents/screens";


export default function ShowScreens(): React.JSX.Element {
    return (
        <ScreensProvider>
            <Provider store={store}>
                <ShowScreensContent />
            </Provider>
        </ScreensProvider>
    )
}

function ShowScreensContent(): React.JSX.Element {
    useScreensCallback(nextScreen);
    return (
        <>
            <ShowScreen id={0} />
            <ShowScreen id={1} />
        </>
    )
}