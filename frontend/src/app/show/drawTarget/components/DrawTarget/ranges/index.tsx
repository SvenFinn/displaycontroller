import { DrawTargetProps } from "..";
import styles from "./ranges.module.css";
import Range from "./range";
import RangeGrid from "../../../../components/Ranges/Grid";

export default function Ranges({ options }: DrawTargetProps): React.JSX.Element {
    return (
        <RangeGrid rows={options.rows} columns={options.columns} className={styles.drawTargetRanges}>
            {options.ranges.map((range: number) => (
                <Range id={range} highlightAssign={options.highlightAssign} key={range} />
            ))}
        </RangeGrid>
    )
}