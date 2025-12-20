import { DrawHit } from "./hit"
import { Hits, Range, Round, UnsignedNumber } from "dc-ranges-types";
import TargetCircle from "./targetCircle";
import { memo } from "react";
import { compareJSON } from "..";

export const DrawHits = memo(
    ({ round, hits, gauge, strokeWidth }: { round: Round | null, hits: Hits, gauge: UnsignedNumber, strokeWidth: number }): React.JSX.Element => {
        if (round?.mode.mode == "fullHidden") return <></>;
        let startingIndex = 0;
        if (round && hits.length < round.maxHits) {
            const hitsPerView = round?.hitsPerView
            startingIndex = Math.floor((hits.length - 1) / hitsPerView) * hitsPerView;
        }
        const hitsCopy = hits.slice(startingIndex)
        return (
            <g>
                {hitsCopy.map((hit, index) => (
                    <DrawHit key={index} layout={round?.layout || null} hit={hit} gauge={gauge} isLatest={index == hitsCopy.length - 1} />
                ))}
                {round?.mode.mode == "circle" ? <TargetCircle hits={hitsCopy} gauge={gauge} strokeWidth={strokeWidth} /> : <></>}
            </g>
        )
    }, compareJSON);