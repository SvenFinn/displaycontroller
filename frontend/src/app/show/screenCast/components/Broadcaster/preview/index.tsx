import { useEffect, useRef } from "react";
import styles from "./preview.module.css";
import { FaCirclePlay } from "react-icons/fa6";

interface PreviewProps {
    onPlay: () => void;
    mediaStream?: MediaStream;
    className?: string;
}

export function Preview({ onPlay, mediaStream, className }: PreviewProps): React.JSX.Element {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
        }
    }, [mediaStream]);

    return (
        <div className={className}>
            <h2>Vorschau</h2>
            <div className={styles.preview}>
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    disablePictureInPicture
                />
                {!mediaStream && (
                    <div className={styles.playIcon}>
                        <FaCirclePlay onClick={onPlay} />
                    </div>
                )}
            </div>
        </div>
    );

}