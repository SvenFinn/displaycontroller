import styles from "./range.module.css"
import { useAppSelector } from "../../ranges-store/store";
import { getTotal } from "@frontend/app/show/lib/ranges/accumulate";

export default function Total({ id }: { id: number }): React.JSX.Element {
    const total = useAppSelector((state => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return null;
        return getTotal(range.discipline.rounds[range.round], range.discipline.gauge, range.hits[range.round] || []);
    }));
    if (total === null) return <></>;
    return (
        <div className={styles.total}>
            {total}
        </div>
    )
}