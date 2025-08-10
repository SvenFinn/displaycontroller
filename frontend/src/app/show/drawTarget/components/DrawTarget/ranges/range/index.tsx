import styles from "./range.module.css";
import RangeNr from "./rangeNr";
import RangeName from "./name";
import { useAppSelector } from "../../ranges-store/store";
import CurrentHit from "./currentHit";
import DrawRange from "./drawRange";
import SeriesList from "./seriesList";
import Total from "./total";
import { useRef } from "react";

interface DrawTargetRangeProps {
    highlightAssign: boolean;
    id: number | null;
}

export default function Range({ highlightAssign, id }: DrawTargetRangeProps): React.JSX.Element {
    if (id == null) return <div></div>;

    const { shouldRender, shouldHighlightBase } = useAppSelector((state) => {
        const range = state.ranges[id];
        if (!range) return { shouldRender: false, shouldHighlightBase: false };

        return {
            shouldRender: range.active,
            shouldHighlightBase: range.active && !!range.shooter && range.hasBeenFree,
        };
    });

    const shouldHighlight = shouldHighlightBase && highlightAssign;

    if (!shouldRender) return <div></div>;

    return (
        <div className={styles.range} style={{ animation: shouldHighlight ? "" : "none" }}>
            <RangeNr id={id} />
            <RangeName id={id} />
            <CurrentHit id={id} />
            <DrawRange id={id} />
            <SeriesList id={id} />
            <Total id={id} />
        </div>
    );
}
