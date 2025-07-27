import { Range } from "dc-ranges-types";
import { FaArrowUp } from "react-icons/fa6";

interface ShotArrowProps {
    hitIndex: number;
    range: Range | null;
    className?: string;
}

export default function ShotArrow({ hitIndex, className, range }: ShotArrowProps): React.JSX.Element {
    if (!range) return <></>;
    if (!range.active) return <></>;
    if (!range.discipline) return <></>;
    const round = range.discipline.rounds[range.round];
    if (!round) return <></>;
    if (round.mode.mode === "fullHidden") return <></>;

    if (!range.hits) return <></>;
    const hits = range.hits[range.round];
    if (!hits) return <></>;
    const hit = hitIndex >= 0 ? hits[hitIndex] : hits[hits.length + hitIndex];
    if (!hit) return <></>;
    if (!hit.valid) return <></>;
    const angle = -Math.atan2(hit.y, hit.x) + Math.PI / 2;
    return (
        <FaArrowUp className={className || ""} style={{ rotate: `${angle}rad` }} />
    )
}
