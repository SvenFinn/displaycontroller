import styles from "./range.module.css"
import { useAppSelector } from "../../ranges-store/store";
import { getExtrapolated, getTotal } from "@frontend/app/show/lib/ranges/accumulate";

export default function Total({ id, extrapolate }: { id: number, extrapolate: boolean }): React.JSX.Element {
    const total = useAppSelector((state => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return null;
        const extrapolated = extrapolate ? ` (${getExtrapolated(range.discipline.rounds[range.round], range.hits[range.round] || [])}` : "";
        return getTotal(range.discipline.rounds[range.round], range.discipline.gauge, range.hits[range.round] || []) + extrapolated;
    }));
    if (total === null) return <></>;
    return (
        <div className={styles.total}>
            {total}
        </div>
    )
}