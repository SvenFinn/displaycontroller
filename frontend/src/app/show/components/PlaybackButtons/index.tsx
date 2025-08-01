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
            {paused ? (
                <FaRegCirclePlay className={styles.play} onClick={() => togglePaused()} />
            ) : (
                <FaRegCirclePause className={styles.play} onClick={() => togglePaused()} />
            )}
            <FaChevronRight className={styles.next} onClick={() => nextScreen()} />
            <FaChevronLeft className={styles.previous} onClick={() => previousScreen()} />
        </>
    );
}