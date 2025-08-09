"use client";

import { useHost } from "@frontend/app/hooks/useHost";
import styles from "./buttons.module.css";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCirclePause, FaRegCirclePlay } from "react-icons/fa6";

export default function Buttons(): React.JSX.Element {
    const [paused, setPaused] = useState(false);
    const host = useHost();

    useEffect(() => {
        fetchPausedState();
    }, [host]);

    if (!host) {
        return <></>;
    }

    async function fetchPausedState() {
        if (!host) {
            return;
        }
        const response = await fetch(`${host}/api/screens/pause`);
        if (response.ok) {
            const data = await response.json();
            setPaused(data);
        } else {
            console.error("Failed to fetch paused state");
        }
    }

    async function togglePaused() {
        await fetch(`${host}/api/screens/pause`, { method: "POST" });
        fetchPausedState();
    }

    async function nextScreen() {
        await fetch(`${host}/api/screens/next`, { method: "POST" });
    }

    async function previousScreen() {
        await fetch(`${host}/api/screens/previous`, { method: "POST" });
    }

    return (
        <>
            <div className={styles.play}>
                <div className={styles.vertical}>
                    {paused ? (
                        <FaRegCirclePlay onClick={() => togglePaused()} />
                    ) : (
                        <FaRegCirclePause onClick={() => togglePaused()} />
                    )}
                </div>
            </div >
            <div className={styles.next}>
                <div className={styles.vertical}>
                    <FaChevronRight onClick={() => nextScreen()} />
                </div>
            </div>
            <div className={styles.previous}>
                <div className={styles.vertical}>
                    <FaChevronLeft onClick={() => previousScreen()} />
                </div>
            </div>
        </>
    );
}