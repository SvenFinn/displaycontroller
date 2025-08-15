import Overlay from "../Overlay";
import styles from "./loading.module.css";


interface LoadingProps {
    percentage?: number;
    message: string;
    isLoading: boolean;
}

export default function Loading({ percentage, message, isLoading }: LoadingProps) {
    if (!isLoading) {
        return <></>;
    }
    return (
        <Overlay>
            <div className={styles.loader}>
                <div className={styles.spinner}>
                </div>
                {percentage && percentage > 0 && percentage < 100 && (
                    <progress className={styles.progress} value={percentage} max={100} />
                )}
                <div className={styles.message}>
                    {message}
                </div>
            </div>
        </Overlay>
    );
}