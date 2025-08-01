import { Range } from "@shared/ranges";
import ShotArrow from "../../../../../components/ShotArrow";
import styles from "./range.module.css";

export default function ShotArrowW({ range }: { range: Range }): React.JSX.Element {
    return (
        <ShotArrow hitIndex={-1} className={styles.shotArrow} range={range} />
    )
}