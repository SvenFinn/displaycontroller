import Overlay from "../../Overlay";
import styles from "./Loader.module.css";

type LoaderProps = {
    percentage: number;
    message: string;
}

export default function Loader({ percentage, message }: LoaderProps) {
    return (
        <Overlay>
            <div className={styles.loader}>
                <div className={styles.spinner}>
                </div>
                {percentage > 0 && percentage < 100 && (
                    <progress className={styles.progress} value={percentage} max={100} />
                )}
                <div className={styles.message}>
                    {message}
                </div>
            </div>
        </Overlay>
    );
}