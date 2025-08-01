"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScreenShareSocket } from "@frontend/app/show/components/ServerEvents/SocketIO/screenShare";
import { Preview } from "./preview";
import { ClientTable } from "./clientTable";
import { FaPlay, FaStop } from "react-icons/fa6";
import styles from "./broadcaster.module.css";

const config: RTCConfiguration = {};

export const ScreenCastBroadcaster: React.FC = () => {
    const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
    const socket = useScreenShareSocket();

    const [mediaStream, setMediaStream] = useState<MediaStream | undefined>(undefined);
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [connected, setConnected] = useState(false);

    // Socket handlers for transmission
    useEffect(() => {
        if (!isTransmitting) return;

        function handleAnswer(id: string, description: RTCSessionDescriptionInit) {
            peerConnections.current[id]?.setRemoteDescription(description);
        }

        async function handleViewer(id: string) {
            if (peerConnections.current[id]) return;

            const pc = new RTCPeerConnection(config);
            peerConnections.current[id] = pc;

            const stream = mediaStream;
            if (!stream) return;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };

            pc.addEventListener("connectionstatechange", () => {
                //Loop through all peer connections and check if any are connected
                const allDisconnected = Object.values(peerConnections.current).every(pc => pc.connectionState !== "connected");
                setConnected(!allDisconnected);
            });


            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", id, pc.localDescription);
        }

        function handleCandidate(id: string, candidate: RTCIceCandidateInit) {
            const pc = peerConnections.current[id];
            if (pc) {
                pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
        }

        function handleViewerDisconnected(id: string) {
            peerConnections.current[id]?.close();
            delete peerConnections.current[id];
        }

        socket.on("answer", handleAnswer);
        socket.on("viewer", handleViewer);
        socket.on("candidate", handleCandidate);
        socket.on("viewerDisconnected", handleViewerDisconnected);

        socket.emit("broadcaster");

        return () => {
            socket.off("answer", handleAnswer);
            socket.off("viewer", handleViewer);
            socket.off("candidate", handleCandidate);
            socket.off("viewerDisconnected", handleViewerDisconnected);
            stopTransmitting();
        };
    }, [isTransmitting, socket]);

    async function startPreview() {
        if (mediaStream) return;

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false, // set to true to include system audio
            });

            //Detect if mediaStream is closed, if so, reset the state
            for (const track of stream.getVideoTracks()) {
                track.addEventListener("ended", () => {
                    setMediaStream(undefined);
                    stopTransmitting();
                });
            }

            setMediaStream(stream);
        } catch (err) {
            console.error("Screen capture failed:", err);
        }
    }

    async function startTransmitting() {
        if (isTransmitting) return;
        if (!mediaStream) {
            await startPreview();
        }

        setIsTransmitting(true);
    }

    function stopTransmitting() {
        if (!isTransmitting) return;
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        socket.emit("stopBroadcast");
        setIsTransmitting(false);
    }

    return (
        <div>
            {!isTransmitting && (
                <button onClick={startTransmitting} className={styles.button}>
                    <FaPlay /> Übertragung starten
                </button>
            )}
            {isTransmitting && (
                <button onClick={stopTransmitting} className={styles.button}>
                    <FaStop /> Übertragung beenden
                </button>
            )}
            <div className={styles.previewContainer}>
                <div className={styles.clients}>
                    {isTransmitting && (
                        <ClientTable peerConnections={peerConnections.current} className={styles.clientTable} />
                    )}
                </div>
                <Preview onPlay={startPreview} mediaStream={mediaStream} className={styles.preview} />

            </div>
        </div>
    );
};

export default ScreenCastBroadcaster;