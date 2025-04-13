import styles from "./Overlay.module.css";


export default function Overlay({ children }: { children?: React.ReactNode }) {
    return (
        <div className={styles.overlay}>
            {children || ""}
        </div>
    );
}