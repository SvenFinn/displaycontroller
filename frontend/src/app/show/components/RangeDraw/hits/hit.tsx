import { Hit } from "@shared/ranges/hits";
import { idealTextColor } from "../../../lib/idealTextColor";
import styles from "../rangeDraw.module.css";

interface HitProps {
    hit: Hit,
    gauge: number,
    isLatest: boolean
}

export default function DrawHit({ hit, gauge, isLatest }: HitProps): React.JSX.Element {
    const color = getColor(hit.rings, isLatest);
    const textColor = idealTextColor(color);
    return (
        <g key={hit.id}>
            <circle cx={hit.x * 100} cy={-hit.y * 100} r={gauge * 50} fill={color} stroke={textColor} />
            <text x={hit.x * 100} y={-hit.y * 100} fontSize={gauge * 50} className={styles.text} fill={textColor}>
                {hit.id}
            </text>
        </g>

    )
}

function getColor(ring: number, isLatest: boolean): string {
    if (!isLatest) return "#000000";
    if (ring >= 10) return "#FF0000";
    if (ring >= 9) return "#FFFF00";
    return "#0000FF";
}