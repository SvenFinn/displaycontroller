import { getTotal } from "@frontend/app/show/lib/ranges";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";



export function HitTotal({ id }: { id: number }): React.JSX.Element {
    const range = useAppSelector((state) => state.ranges[id]?.active ? state.ranges[id] : null);
    if (!range) {
        return <></>;
    }
    return (
        <span className={styles.value}>{getTotal(range)}</span>
    )
}