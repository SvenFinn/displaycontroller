import { FaSpinner } from "react-icons/fa6";
import styles from "./clientTable.module.css";

interface ClientTableProps {
    peerConnections: Record<string, RTCPeerConnection>;
    className?: string;
}

export function ClientTable({ peerConnections, className }: ClientTableProps): React.JSX.Element {
    const connected = Object.values(peerConnections).some(pc => pc.connectionState === "connected");


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
                        {Object.entries(peerConnections).map(([id, pc]) => (
                            <tr key={id}>
                                <td>{id}</td>
                                <td>{pc.connectionState}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </ >
    )
}