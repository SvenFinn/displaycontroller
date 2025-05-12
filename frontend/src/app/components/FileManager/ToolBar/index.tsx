import { ReactNode } from "react";
import styles from "./ToolBar.module.css";
import { FiRefreshCw } from "react-icons/fi";

type ToolBarProps = {
    children?: ReactNode;
    refresh?: () => void;
}

export default function ToolBar({ children, refresh }: ToolBarProps) {
    if (!children && !refresh) {
        return <></>;
    }
    return (
        <div className={styles.toolBar}>
            {children}
            {refresh && <FiRefreshCw className={styles.refresh} onClick={refresh} />}
        </div>
    )
}

