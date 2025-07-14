import { Range } from "dc-ranges-types";
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