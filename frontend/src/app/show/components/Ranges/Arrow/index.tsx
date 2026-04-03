import { ValidHit } from "dc-ranges/types";
import { FaArrowUp } from "react-icons/fa6";

interface ShotArrowProps {
    hit?: ValidHit;
    className?: string;
}

export default function ShotArrow({ hit, className }: ShotArrowProps): React.JSX.Element {
    if (!hit) return <></>;
    if (hit.x === 0 && hit.y === 0) return <div className={className || ""} />;
    const angle = -Math.atan2(hit.y, hit.x) + Math.PI / 2;
    return (
        <FaArrowUp className={className || ""} style={{ rotate: `${angle}rad` }} />
    )
}
