import ShotArrow from "../../../../../components/Ranges/Arrow";
import styles from "./range.module.css";
import { useAppSelector } from "../../ranges-store/store";

export default function ShotArrowW({ id }: { id: number }): React.JSX.Element {
    const hit = useAppSelector((state) => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return undefined;
        const hits = range.hits[range.round] || undefined;
        if (!hits || hits.length === 0) return undefined;
        const hit = hits[hits.length - 1];
        if (!hit.valid) return undefined;
        return hit;
    });
    return (
        <ShotArrow className={styles.shotArrow} hit={hit} />
    )
}