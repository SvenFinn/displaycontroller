import styles from "./range.module.css"
import ShotArrowW from "./ShotArrow";
import { Hit, Round } from "dc-ranges-types";
import { useAppSelector } from "../../ranges-store/store";
import { ScaleText } from "@frontend/app/components/base/ScaleText";
import { getHitEval } from "@frontend/app/show/lib/ranges/eval";

interface CurrentHitProps {
    id: number
}

export default function CurrentHit({ id }: CurrentHitProps): React.JSX.Element {
    // This only needs to rerender if the hits change, so we can use a simple selector
    const hit = useAppSelector((state) => {
        const currentRange = state.ranges[id];
        if (!currentRange || !currentRange.active) return null;
        const round = currentRange.discipline?.rounds[currentRange.round];
        if (!round) return "Unbekannt";
        const hits = currentRange.hits[currentRange.round];
        if (!hits) return round.name;
        return getHit(round, hits[hits.length - 1]) || round.name

    });

    if (!hit) return <></>

    return (
        <div className={styles.currentShot}>
            <ShotArrowW id={id} />
            <ScaleText text={hit} />
        </div>
    )
}

function getHit(round: Round, hit?: Hit): string | null {
    if (!hit) return null;
    if (!hit.valid) return `${hit.id}: Ungültig`;
    const hitEval = getHitEval(round, hit);
    if (!hitEval) return null;
    const prefix = `${hitEval.id}: `
    switch (hitEval.kind) {
        case "rings":
            return prefix + hitEval.rings;
        case "divider":
            return prefix + hitEval.divider;
        case "hundred":
            return prefix + hitEval.hundred;
        case "circle":
            return prefix + `${hitEval.x} ${hitEval.y}`
        case "hidden":
            return prefix + "***";
        case "decimal":
            return prefix + hitEval.decimal;
        case "integerDecimal":
            return prefix + hitEval.integerTimesDecimal;
        case "ringsDiv":
            return prefix + `${hitEval.rings} ${hitEval.divider}`;
        default:
            const _exhaustive: never = hitEval;
            return _exhaustive;
    }
}