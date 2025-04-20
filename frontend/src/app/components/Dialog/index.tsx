import { FaX } from "react-icons/fa6";
import Overlay from "../Overlay";
import styles from "./Dialog.module.css";

type DialogProps = {
    title: string;
    children?: React.ReactNode;
    cancelText?: string;
    confirmText?: string;
    confirmColor?: string;
    cancelColor?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
}

export default function Dialog({ title, children, cancelText, cancelColor, confirmText, confirmColor, onCancel, onConfirm }: DialogProps) {
    return (
        <Overlay>
            <div className={styles.dialog}>
                <div className={styles.dialogHeader}>
                    <h2>{title}</h2>
                    <button onClick={onCancel} className={styles.closeButton}><FaX size="1.5em" /></button>
                </div>
                <div className={styles.dialogBody}>
                    {children}
                </div>
                {(onCancel || onConfirm) && (
                    <div className={styles.dialogFooter}>
                        {onCancel && (
                            <button className={styles.cancelButton} style={{ backgroundColor: cancelColor || "white" }} onClick={onCancel}>
                                {cancelText || "Cancel"}
                            </button>
                        )}
                        {onConfirm && (
                            <button className={styles.confirmButton} style={{ backgroundColor: confirmColor || "white" }} onClick={onConfirm}>
                                {confirmText || "Confirm"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Overlay>
    );
}
