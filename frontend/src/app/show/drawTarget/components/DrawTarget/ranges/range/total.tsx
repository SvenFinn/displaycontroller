import { Range } from "@shared/ranges";
import { getTotal } from "../../../../../lib/ranges";
import styles from "./range.module.css"

export default function Total({ range }: { range: Range }): React.JSX.Element {
    const total = getTotal(range);
    return (
        <div className={styles.total}>
            {total}
        </div>
    )
}