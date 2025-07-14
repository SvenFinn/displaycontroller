import { Range, LayoutRectangle } from "dc-ranges-types";

interface RectangleLayoutProps {
    layout: LayoutRectangle,
    color: string
}


export default function RectangleLayout({ layout, color }: RectangleLayoutProps): React.JSX.Element {
    if (layout.mode !== "rectangle") return <></>;
    const { x, y, width, height } = layout;
    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
            stroke='#000000'
        />

    )
}

export function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    if (layout.mode !== "rectangle") return [0, 0];
    return [layout.width, layout.height];
}
