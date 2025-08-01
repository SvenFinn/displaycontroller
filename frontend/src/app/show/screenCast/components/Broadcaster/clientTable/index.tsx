import { FaSpinner } from "react-icons/fa6";
import styles from "./clientTable.module.css";
import { useEffect, useState } from "react";

interface ClientTableProps {
    peerConnections: Record<string, RTCPeerConnection>;
    className?: string;
    clientCount: number;
}

export function ClientTable({ peerConnections, className, clientCount }: ClientTableProps): React.JSX.Element {
    const [pcState, setPcState] = useState<Record<string, string>>({});

    useEffect(() => {
        function updatePcState() {
            const newState: Record<string, string> = {};
            Object.entries(peerConnections).forEach(([id, pc]) => {
                newState[id] = pc.connectionState;
            });
            setPcState(newState);
        }
        updatePcState();

        for (const pc of Object.values(peerConnections)) {
            pc.addEventListener("connectionstatechange", updatePcState);
        }
        return () => {
            for (const pc of Object.values(peerConnections)) {
                pc.removeEventListener("connectionstatechange", updatePcState);
            }
        };
    }, [peerConnections, clientCount]);

    const connected = Object.values(pcState).some(pc => pc === "connected");

    return (
        <>
            {(!connected) && (
                <p><FaSpinner className={styles.spinner} /> Waiting for clients...</p>
            )}
            {connected && (
                <table className={className}>
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Connection State</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(pcState).map(([id, pc]) => (
                            <tr key={id}>
                                <td>{id}</td>
                                <td>{pc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </ >
    )
}