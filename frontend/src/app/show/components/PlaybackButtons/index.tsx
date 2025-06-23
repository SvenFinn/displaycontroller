"use client";

import styles from "./buttons.module.css";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCirclePause, FaRegCirclePlay } from "react-icons/fa6";

export default function Buttons(): React.JSX.Element {
    const [paused, setPaused] = useState(false);

    async function fetchPausedState() {
        const host = window.location.host.split(":")[0];
        const response = await fetch(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/screens/pause`);
        if (response.ok) {
            const data = await response.json();
            setPaused(data);
        } else {
            console.error("Failed to fetch paused state");
        }
    }


    useEffect(() => {
        fetchPausedState();
    }, []);

    async function togglePaused() {
        const host = window.location.host.split(":")[0];
        await fetch(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/screens/pause`, { method: "POST" });
        fetchPausedState();
    }

    async function nextScreen() {
        const host = window.location.host.split(":")[0];
        await fetch(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/screens/next`, { method: "POST" });
    }

    async function previousScreen() {
        const host = window.location.host.split(":")[0];
        await fetch(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/screens/previous`, { method: "POST" });
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