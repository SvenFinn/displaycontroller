"use client";

import { DbScreen } from "dc-screens-types";
import ScreenEdit from "./components/Screens";
import ColumnResize from "@frontend/app/components/ColumnResize";
import { ScreenList } from "./components/ScreenList";
import { store, useAppDispatch, useAppSelector } from "./store/store";
import { Provider } from "react-redux";
import { Preview } from "./components/Preview";
import { useEffect, useRef, useState } from "react";
import { clearError, fetchScreens, updateScreen } from "./store/screensReducer";
import Loading from "@frontend/app/components/Loading";
import Dialog from "@frontend/app/components/Dialog";

export default function Page() {

    return (
        <Provider store={store}>
            <EditContent />
        </Provider>
    );
}

function EditContent() {
    const screen = useAppSelector(state => state.screens.screens.find(s => s.id === state.screens.currentScreenId) || null);
    const loadingStr = useAppSelector(state => state.screens.loading);
    const errorStr = useAppSelector(state => state.screens.error);
    const [previewScreen, setPreviewScreen] = useState<DbScreen | null>(null);
    const [maxHeight, setMaxHeight] = useState(0);
    const columnRef = useRef<HTMLDivElement | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setPreviewScreen(screen);
    }, [screen]);

    function onChange(data: DbScreen) {
        if (JSON.stringify(data.options) !== JSON.stringify(previewScreen?.options)) {
            setPreviewScreen(data);
        }
    }


    useEffect(() => {

        function handleResize() {
            if (!ref.current || !columnRef.current) return;
            const container = ref.current;
            setMaxHeight(container.clientHeight - 1);
        }

        const resizeObserver = new ResizeObserver(handleResize);
        if (ref.current) {
            resizeObserver.observe(ref.current);
        }
        handleResize();

        return () => {
            resizeObserver.disconnect();
        }
    }, []);

    useEffect(() => {
        dispatch(fetchScreens());
    }, []);

    return (
        <div ref={ref} style={{ height: "100%" }}>
            <ColumnResize initialSizes={[20, 60, 20]} ref={columnRef} style={{ height: `${maxHeight}px` }}>
                <ScreenList />
                <ScreenEdit
                    onSubmit={(data) => dispatch(updateScreen(data))}
                    onChange={onChange}
                    screen={screen}
                /*className={ }*/
                />
                <Preview screen={previewScreen} />
            </ColumnResize>
            {loadingStr && <Loading message={loadingStr} isLoading={true} />}
            {errorStr && <Dialog title="Fehler" onConfirm={() => dispatch(clearError())}>{errorStr}</Dialog>}
        </div>
    );
}
