import Overlay from "../../Overlay";
import { LoaderHook } from "./hook";
import styles from "./Loader.module.css";


export default function Loader({ loader }: { loader: LoaderHook }) {
    const { percentage, message, isLoading } = loader;
    if (!isLoading) {
        return <></>;
    }
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