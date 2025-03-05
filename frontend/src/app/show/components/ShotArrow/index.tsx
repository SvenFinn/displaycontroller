import { Hit } from "@shared/ranges/hits";
import arrowImage from "./arrow.png";
import { Range } from "@shared/ranges";

interface ShotArrowProps {
    hitIndex: number;
    range: Range | null;
    className: string;
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
    const angle = -Math.atan2(hit.y, hit.x) + Math.PI / 2;
    return (
        <img src={arrowImage.src} className={className} style={{
            transform: `rotate(${angle}rad)`
        }} />
    )
}
