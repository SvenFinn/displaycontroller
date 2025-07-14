import { Hit } from "dc-ranges-types";
import enclosingCircle from "smallest-enclosing-circle";
import styles from "../rangeDraw.module.css";


export default function TargetCircle({ hits, gauge, strokeWidth }: { hits: Hit[], gauge: number, strokeWidth: number }): React.JSX.Element {
    const circle = enclosingCircle(hits.filter((hit) => hit.valid).map((hit) => {
        return { x: hit.x, y: hit.y }
    }));
    const radius = circle.r + (gauge / 2);
    return (
        <circle cx={circle.x} cy={-circle.y} r={radius} className={styles.targetCircle} strokeWidth={strokeWidth * 4} />
    )
}