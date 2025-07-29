"use client";

import ScreenCastBroadcaster from "./components/Broadcaster";

export default function ScreenCastPage() {
    return (
        <>
            <h1>Screen Cast</h1>
            <p>Hier kannst du deinen Bildschirm auf den Displaycontroller übertragen. Dein Bildschirm wird dann auf allen verbundenen Geräten angezeigt.</p>
            <ScreenCastBroadcaster />

        </>
    );
}
