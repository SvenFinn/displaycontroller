import { Hit } from "@shared/ranges/hits";
import enclosingCircle from "smallest-enclosing-circle";
import styles from "../rangeDraw.module.css";


export default function TargetCircle({ hits, gauge, strokeWidth }: { hits: Hit[], gauge: number, strokeWidth: number }): React.JSX.Element {
    const circle = enclosingCircle(hits.map((hit) => {
        return { x: hit.x * 100, y: hit.y * 100 }
    }));
    const radius = circle.r + (gauge * 50);
    return (
        <circle cx={circle.x} cy={-circle.y} r={radius} className={styles.targetCircle} strokeWidth={strokeWidth * 4} />
    )
}