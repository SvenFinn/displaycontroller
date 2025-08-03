import ShotArrow from "../../../../../components/Ranges/Arrow";
import styles from "./range.module.css";
import { useAppSelector } from "../../ranges-store/store";

export default function ShotArrowW({ id }: { id: number }): React.JSX.Element {
    const range = useAppSelector((state) => state.ranges[id]?.active ? state.ranges[id] : null);
    return (
        <ShotArrow hitIndex={-1} className={styles.shotArrow} range={range} />
    )
}