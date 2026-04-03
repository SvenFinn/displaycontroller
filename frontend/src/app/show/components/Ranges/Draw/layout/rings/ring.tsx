import { idealTextColor } from "../../../../../lib/idealTextColor";
import { LayoutRing } from "dc-ranges/types";

interface RingsProps {
    ring: LayoutRing,
    nextDiameter: number | undefined,
    printText: boolean,
    color: string
}

interface TextPosition {
    x: number,
    y: number
}

export default function Ring({ ring, nextDiameter, printText, color }: RingsProps): React.JSX.Element {
    const fontSize = Math.abs(ring.diameter - (nextDiameter || 0)) / 4;
    const ringColor = ring.colored ? color : "#FFFFFF";
    const textColor = idealTextColor(ringColor);
    let textPositions: Array<TextPosition> = [];
    if (printText) {
        textPositions = [
            { x: 0, y: ring.diameter / 2 - fontSize },
            { x: ring.diameter / 2 - fontSize, y: 0 },
            { x: 0, y: -ring.diameter / 2 + fontSize },
            { x: -ring.diameter / 2 + fontSize, y: 0 }
        ];
    }

    return (
        <g key={ring.value}>
            <circle cx="0" cy="0" r={ring.diameter / 2} fill={ringColor} stroke={textColor} />
            {textPositions.map((pos, index) => (
                <text key={index} x={pos.x} y={pos.y} fill={textColor} fontSize={fontSize}>{ring.value}</text>
            ))}

        </g>
    )
}