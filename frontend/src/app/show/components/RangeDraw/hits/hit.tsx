import { Hit } from "@shared/ranges/hits";
import { idealTextColor } from "../../../lib/idealTextColor";
import { getHitColor } from "../layout";
import { DisciplineLayout } from "@shared/ranges/discipline/layout";

interface HitProps {
    hit: Hit,
    layout: DisciplineLayout,
    gauge: number,
    isLatest: boolean
}

export default function DrawHit({ layout, hit, gauge, isLatest }: HitProps): React.JSX.Element {
    const color = getHitColor(layout, hit.rings, isLatest);
    const textColor = idealTextColor(color);
    return (
        <g key={hit.id}>
            <circle cx={hit.x * 100} cy={-hit.y * 100} r={gauge * 50} fill={color} stroke={textColor} />
            <text x={hit.x * 100} y={-hit.y * 100} fontSize={gauge * 50} fill={textColor}>
                {hit.id}
            </text>
        </g>

    )
}