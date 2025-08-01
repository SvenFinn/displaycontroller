import { DrawTargetProps } from "../drawTarget";
import styles from "./ranges.module.css";
import Range from "./range";

export default function Ranges({ options }: DrawTargetProps): React.JSX.Element {
    return (
        <div className={styles.drawTargetRanges} style={{
            gridTemplateColumns: `repeat(${options.columns}, 1fr)`,
            gridTemplateRows: `repeat(${options.rows}, 1fr)`,
            fontSize: `${100 / options.rows}%`
        }}>
            {options.ranges.map((range: number) => (
                <Range id={range} highlightAssign={options.highlightAssign} key={range} />
            ))}
        </div>
    )
}