import { Hit } from "@shared/ranges/hits";
import { idealTextColor } from "../../../../lib/idealTextColor";
import { getHitColor } from "../layout";
import { Layout } from "@shared/ranges/discipline/layout";

interface HitProps {
    hit: Hit,
    layout: Layout | null,
    gauge: number,
    isLatest: boolean
}

export default function DrawHit({ layout, hit, gauge, isLatest }: HitProps): React.JSX.Element {
    if (!hit.valid) return <></>;
    const color = getHitColor(layout, hit.rings, isLatest);
    const textColor = idealTextColor(color);
    return (
        <g key={hit.id}>
            <circle cx={hit.x} cy={-hit.y} r={gauge / 2} fill={color} stroke={textColor} />
            <text x={hit.x} y={-hit.y} fontSize={gauge / 2} fill={textColor}>
                {hit.id}
            </text>
        </g>

    )
}