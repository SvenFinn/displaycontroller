import { CpcViewOptions } from "dc-screens-types"
import RangeGrid from "@frontend/app/show/components/Ranges/Grid";
import CpcViewRange from "./range";
import styles from "./ranges.module.css";

interface RangesProps {
    options: CpcViewOptions
}

export default function Ranges({ options }: RangesProps): React.JSX.Element {
    return (
        <RangeGrid rows={options.rows} columns={options.columns} className={styles.ranges}>
            {options.ranges.map((range) => (
                <CpcViewRange id={range} key={range} />
            ))}
        </ RangeGrid>
    )
}