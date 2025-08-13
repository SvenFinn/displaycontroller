import { useHost } from "@frontend/app/hooks/useHost";
import { DbScreen, isScreen, Screen } from "dc-screens-types";
import { useEffect, useRef, useState } from "react";
import { getScreenComponent } from "../Screens/ShowScreen";
import Show from "../Show";
import styles from "./localScreen.module.css";

interface LocalScreenProps {
    screen: Omit<DbScreen, "id" | "conditions" | "visibleFrom" | "visibleUntil">;
    onReady?: () => void;
    mode?: "parallel" | "sequential";
    className?: string;
}

export default function LocalScreen({ screen, onReady = () => { }, mode = "sequential", className }: LocalScreenProps): React.JSX.Element {
    const [screens, setScreens] = useState<Screen[]>([{ available: false }]);
    const [currentScreenId, setCurrentScreenId] = useState<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const host = useHost();

    useEffect(() => {
        if (!host) return;
        async function resolveScreens() {
            const screenData: DbScreen = {
                id: 0,
                visibleFrom: null,
                visibleUntil: null,
                conditions: null,
                ...screen
            };
            const response = await fetch(`${host}/api/screens/resolve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(screenData)
            });
            if (response.status !== 200) {
                setScreens([{ available: false }]);
                console.error("Failed to resolve screens", response.statusText);
                return;
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                setScreens([{ available: false }]);
                console.error("Invalid screens response", data);
                return;
            }
            for (let i = 0; i < data.length; i++) {
                if (!isScreen(data[i])) {
                    console.error(`Invalid screen at index ${i}`, data[i]);
                    setScreens([{ available: false }]);
                    return;
                }
            }
            setScreens(data);
            setCurrentScreenId(0);
        }
        resolveScreens();

    }, [host, screen]);

    useEffect(() => {
        if (mode !== "sequential") return;
        function showNextScreen() {
            setCurrentScreenId(prevId => {
                const nextId = prevId >= screens.length - 1 ? 0 : prevId + 1;
                const currentScreen = screens[nextId];
                timeoutRef.current = setTimeout(
                    showNextScreen,
                    currentScreen.available ? currentScreen.duration * 1000 : 10000
                );
                return nextId;
            });
        }
        const initialScreen = screens[currentScreenId];
        timeoutRef.current = setTimeout(showNextScreen, initialScreen.available ? initialScreen.duration * 1000 : 10000);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [screens, mode]);

    return (
        // If mode is sequential, show the current screen
        // If mode is parallel, show all screens
        <div className={`${styles.localScreen} ${className || ""}`}>
            {mode === "sequential" ? (
                <RenderScreen screen={screens[currentScreenId]} onReady={onReady} />
            ) : (
                screens.map((screen, index) => (
                    <div key={index}>
                        <RenderScreen screen={screen} onReady={onReady} />
                    </div>
                ))
            )}
        </div>
    );

}

function RenderScreen({ screen, onReady }: { screen: Screen, onReady: () => void }): React.JSX.Element {
    return (
        <Show>
            {screen.available && getScreenComponent(screen, onReady)}
        </Show>
    )
}