import { DrawTargetProps } from "../drawTarget";
import styles from "./ranges.module.css";
import Range from "./range";
import RangeGrid from "../../../../components/Ranges/Grid";

export default function Ranges({ options }: DrawTargetProps): React.JSX.Element {
    const ranges = options.ranges.slice(0, options.rows * options.columns);
    return (
        <RangeGrid rows={options.rows} columns={options.columns} className={styles.drawTargetRanges}>
            {ranges.map((range) => (
                <Range id={range} highlightAssign={options.highlightAssign} key={range} />
            ))}
        </RangeGrid>
    )
}