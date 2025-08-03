import { Range } from "dc-ranges-types";
import { getTotal } from "../../../../../lib/ranges";
import styles from "./range.module.css"
import { useAppSelector } from "../../ranges-store/store";

export default function Total({ id }: { id: number }): React.JSX.Element {
    const total = useAppSelector((state => {
        const range = state.ranges[id];
        if (!range || !range.active) return null;
        return getTotal(range);
    }));
    if (total === null) return <></>;
    return (
        <div className={styles.total}>
            {total}
        </div>
    )
}