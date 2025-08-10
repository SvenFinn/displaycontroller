"use client";

import { SizeWrapper } from "@frontend/app/show/components/SizeWrapper";
import styles from "./viewer.module.css";
import { ScreenShareSocketState, useScreenShareSocket } from "@frontend/app/show/components/ServerEvents/SocketIO/screenShare";
import { useEffect, useRef, useState } from "react";

export default function ScreenCastViewer({ onReady }: { onReady: () => void }): React.JSX.Element {
    useEffect(() => {
        onReady();
    }, [onReady]);
    const [connected, setConnected] = useState(false);
    const [broadcasterId, setBroadcasterId] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socket = useScreenShareSocket();


    // Handle connection state changes
    useEffect(() => {
        if (!broadcasterId) return;

        peerConnection.current = new RTCPeerConnection();

        const onConnectionStateChange = () => {
            const state = peerConnection.current?.connectionState;
            setConnected(state === "connected");
        };

        peerConnection.current.addEventListener("connectionstatechange", onConnectionStateChange);

        const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
            if (broadcasterId && event.candidate) {
                socket.emit("candidate", broadcasterId, event.candidate);
            }
        };
        peerConnection.current.addEventListener("icecandidate", onIceCandidate);

        const handleOffer = async (id: string, message: RTCSessionDescriptionInit) => {
            if (!peerConnection.current) return;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit("answer", id, answer);
        };
        socket.on("offer", handleOffer);

        const handleCandidate = (id: string, candidate: RTCIceCandidateInit) => {
            peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
        };
        socket.on("candidate", handleCandidate);

        return () => {
            peerConnection.current?.removeEventListener("connectionstatechange", onConnectionStateChange);
            peerConnection.current?.removeEventListener("icecandidate", onIceCandidate);
            peerConnection.current?.close();
            socket.off("offer", handleOffer);
            socket.off("candidate", handleCandidate);
            setConnected(false);
        };
    }, [broadcasterId, socket]);

    // Assign tracks to the video element
    useEffect(() => {
        if (!peerConnection.current || !videoRef.current) return;
        videoRef.current.srcObject = null;

        function assignStream(event: RTCTrackEvent) {
            if (!videoRef.current) return;
            const stream = event.streams[0];
            if (!stream) return;
            videoRef.current.srcObject = stream;
        }
        peerConnection.current.addEventListener("track", assignStream);

        // If tracks already exist
        const receivers = peerConnection.current.getReceivers();
        if (receivers.length > 0) {
            videoRef.current.srcObject = new MediaStream(receivers.map(r => r.track));
        }

        return () => {
            peerConnection.current?.removeEventListener("track", assignStream);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

    }, [connected]);

    // Handle socket events
    useEffect(() => {
        const sendViewer = () => {
            if (socket.connected) socket.emit("viewer");
        };

        socket.on("connect", sendViewer);
        sendViewer();

        socket.on("broadcaster", (id: string) => {
            setBroadcasterId(id);
        });

        return () => {
            socket.off("connect", sendViewer);
            socket.off("broadcaster");
        };
    }, [socket]);

    // Suppress context menu on video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const suppressContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };

        video.addEventListener("contextmenu", suppressContextMenu);
        return () => {
            video.removeEventListener("contextmenu", suppressContextMenu);
        };
    }, [connected]);

    return (
        <div className={styles.viewer}>
            <ScreenShareSocketState />
            {connected ? (
                <video
                    ref={videoRef}
                    className={styles.viewerVideo}
                    autoPlay
                    playsInline
                    muted
                    disablePictureInPicture
                    controls={false}
                />
            ) : (
                <SizeWrapper className={styles.viewerPlaceholder}>
                    <p>Übertragung beendet</p>
                </SizeWrapper>
            )}
        </div>
    );
}

