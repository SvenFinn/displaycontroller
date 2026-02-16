import { getTotal } from "@frontend/app/show/lib/ranges/accumulate";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";

export function HitTotal({ id }: { id: number }): React.JSX.Element {
    const total = useAppSelector((state) => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return null;
        return getTotal(range.discipline.rounds[range.round], range.discipline.gauge, range.hits[range.round] || []);
    })
    if (total === null) {
        return <></>;
    }
    return (
        <span className={styles.value}>{total}</span>
    )
}