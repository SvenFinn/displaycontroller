import ScaleText from "@frontend/app/show/components/ScaleText";
import { getHitString, getRoundName } from "../../../../../lib/ranges";
import styles from "./range.module.css"
import ShotArrowW from "./ShotArrow";
import { Range } from "@shared/ranges";

interface CurrentHitProps {
    range: Range
}

export default function CurrentHit({ range }: CurrentHitProps): React.JSX.Element {
    const hit = getHit(range) || getRoundName(range);
    if (!hit) return <></>
    return (
        <div className={styles.currentShot}>
            <ShotArrowW range={range} />
            <ScaleText text={hit} />
        </div>
    )
}

function getHit(range: Range): string | null {
    const hitArr = getHitString(range);
    if (!hitArr) return null;
    const hitId = hitArr.shift();
    return `${hitId}: ${hitArr.join(" ")}`;
}