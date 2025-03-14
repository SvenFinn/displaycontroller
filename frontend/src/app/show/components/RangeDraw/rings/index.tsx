import { DisciplineLayout } from "@shared/ranges/discipline/layout";
import Ring from "./ring";

interface RingsProps {
    layout: DisciplineLayout,
    color: string
}

export default function Rings({ layout, color }: RingsProps): React.JSX.Element {
    if (!layout) return <></>;
    const layoutCopy = layout.slice().reverse();
    return (
        <g>
            {layoutCopy.map((ring, index) => (
                <Ring key={index} ring={ring} printText={index < layoutCopy.length - 2} nextDiameter={layoutCopy[index + 1]?.diameter} color={color} />
            ))}
        </g>
    )
}