import ScaleText from "@frontend/app/show/components/ScaleText";
import { getHitString, getRoundName } from "../../../../../lib/ranges";
import styles from "./range.module.css"
import ShotArrowW from "./ShotArrow";
import { Range } from "dc-ranges-types";
import { useAppSelector } from "../../ranges-store/store";

interface CurrentHitProps {
    id: number
}

export default function CurrentHit({ id }: CurrentHitProps): React.JSX.Element {
    // This only needs to rerender if the hits change, so we can use a simple selector
    const hit = useAppSelector((state) => {
        const currentRange = state.ranges[id];
        if (!currentRange || !currentRange.active) return null;
        return getHit(currentRange) || getRoundName(currentRange);
    });

    if (!hit) return <></>

    return (
        <div className={styles.currentShot}>
            <ShotArrowW id={id} />
            <ScaleText text={hit} />
        </div>
    )
}

function getHit(range: Range): string | null {
    // If is decimal or integerDecimal, remove rings entry from the array
    if (!range.active) return null;
    if (!range.hits) return null;
    if (!range.discipline) return null;
    const round = range.discipline.rounds[range.round];
    if (!round) return null;
    const hitArr = getHitString(range);
    if (!hitArr) return null;
    const hitId = hitArr.shift();
    if (round.mode.mode === "decimal" || round.mode.mode === "integerDecimal") {
        hitArr.pop();
    }
    return `${hitId}: ${hitArr.join(" ")}`;
}