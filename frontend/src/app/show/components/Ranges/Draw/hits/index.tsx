import Hit from "./hit"
import { Range } from "@shared/ranges";
import TargetCircle from "./targetCircle";

export default function DrawHits({ range, strokeWidth }: { range: Range, strokeWidth: number }): React.JSX.Element {
    if (!range.active) return <></>;
    if (!range.discipline) return <></>;
    const round = range.discipline.rounds[range.round];
    if (!round) return <></>;
    if (round.mode.mode == "fullHidden") return <></>;
    const layout = range.discipline.layouts[round.layoutId];

    const hitsPerView = round.hitsPerView;
    if (!range.hits) return <></>;
    const hits = range.hits[range.round];
    if (!hits) return <></>;
    let startingIndex = 0;
    if (hits.length < round.maxHits) {
        startingIndex = Math.floor((hits.length - 1) / hitsPerView) * hitsPerView;
    }
    const hitsCopy = hits.slice(startingIndex)
    const gauge = range.discipline.gauge;
    return (
        <g>
            {hitsCopy.map((hit, index) => (
                <Hit key={index} layout={layout} hit={hit} gauge={gauge} isLatest={index == hitsCopy.length - 1} />
            ))}
            {round.mode.mode == "circle" ? <TargetCircle hits={hitsCopy} gauge={gauge} strokeWidth={strokeWidth} /> : <></>}
        </g>
    )
}    