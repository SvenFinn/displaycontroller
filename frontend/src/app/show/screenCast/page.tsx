"use client";

import { useEffect, useState } from "react";
import ScreenCastBroadcaster from "./components/Broadcaster";
import styles from "./screenCast.module.css";
import { ScreenShareSocketState } from "../components/ServerEvents/SocketIO/screenShare";

export default function ScreenCastPage() {
    const [isSecure, setIsSecure] = useState(false);

    useEffect(() => {
        setIsSecure(window.isSecureContext);
    }, []);

    function switchToHttps() {
        const currentUrl = window.location.href;
        if (!currentUrl.startsWith("https://")) {
            const httpsUrl = currentUrl.replace("http://", "https://");
            window.location.href = httpsUrl;
        }
    }

    return (
        <>
            {!isSecure && (
                <div className={styles.alert}>
                    <div className={styles.alertContent}>
                        <h1>Bildschirmübertragung</h1>
                        <p>Die Bildschirmübertragung funktioniert nur über eine sichere Verbindung (HTTPS). Bitte stelle sicher, dass du die Seite über HTTPS aufrufst.</p>
                        <button onClick={switchToHttps}>
                            Zur HTTPS-Version wechseln
                        </button>
                    </div>
                </div>)}
            <h1>Bildschirmübertragung</h1>
            <p>Hier kannst du deinen Bildschirm auf den Displaycontroller übertragen. Dein Bildschirm wird dann auf allen verbundenen Geräten angezeigt.</p>
            <ScreenCastBroadcaster />
            <ScreenShareSocketState />
        </>
    );
}
