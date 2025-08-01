import { Range } from "dc-ranges-types";
import ShotArrow from "../../../../../components/Ranges/Arrow";
import styles from "./range.module.css";

export default function ShotArrowW({ range }: { range: Range }): React.JSX.Element {
    return (
        <ShotArrow hitIndex={-1} className={styles.shotArrow} range={range} />
    )
}