import { DisciplineLayoutRing } from "@shared/ranges/discipline/layout";
import { idealTextColor } from "../../../lib/idealTextColor";
import styles from "../rangeDraw.module.css";

interface RingsProps {
    ring: DisciplineLayoutRing,
    nextDiameter: number | undefined,
    printText: boolean,
    color: string
}

export default function Ring({ ring, nextDiameter, printText, color }: RingsProps): React.JSX.Element {
    const fontSize = Math.abs(ring.diameter - (nextDiameter || 0)) * 25;
    const textColor = idealTextColor(ring.colored ? color : "#FFFFFF");
    return (
        <g key={ring.value}>
            <circle cx="0" cy="0" r={ring.diameter * 50} fill={!ring.colored ? "#FFFFFF" : color} stroke={textColor} />
            {printText && <text x="0" y={ring.diameter * 50 - fontSize} className={styles.text} fill={textColor} fontSize={fontSize}>{ring.value}</text>}
            {printText && <text x={ring.diameter * 50 - fontSize} y="0" className={styles.text} fill={textColor} fontSize={fontSize}>{ring.value}</text>}
            {printText && <text x="0" y={-ring.diameter * 50 + fontSize} className={styles.text} fill={textColor} fontSize={fontSize}>{ring.value}</text>}
            {printText && <text x={-ring.diameter * 50 + fontSize} y="0" className={styles.text} fill={textColor} fontSize={fontSize}>{ring.value}</text>}
        </g>
    )
}