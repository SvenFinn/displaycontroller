import { Mode } from "dc-ranges/types";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";
import ShotArrow from "@frontend/app/show/components/Ranges/Arrow";
import React from "react";
import { getHitsOfSeries, getLatestSeriesId } from "@frontend/app/show/lib/ranges";
import { getHitEval } from "@frontend/app/show/lib/ranges/eval";
import { HitEval } from "@frontend/app/show/lib/ranges/types";


export default function ShotTable({ id }: { id: number }): React.JSX.Element {
    const hits = useAppSelector(state => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return [];
        const round = range.discipline.rounds[range.round];
        if (!round) return [];
        const hits = range.hits[range.round] || [];

        const selectedHits = getHitsOfSeries(round, hits, getLatestSeriesId(round, hits));

        return selectedHits.reverse();
    })

    const round = useAppSelector(state => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return null;
        return range.discipline.rounds[range.round];
    })

    if (!round) return <></>;

    return (
        <div className={styles.shotTable} >
            <div className={styles.tableTitle}>
                {
                    getColumns(round.mode).map((col, index) => (
                        <div key={index} className={styles.tableTitleEntry}>
                            {col}
                        </div>
                    ))
                }
            </div>

            {hits.map((hit, index) => {
                if (!hit.valid) {
                    return (
                        <div className={styles.tableRow} key={index}>
                            <div>{hit.id}</div>
                            <div>Ungültig</div>
                        </div>
                    )
                }
                const hitEval = getHitEval(round, hit);
                if (!hitEval) return <></>
                return (
                    <div className={styles.tableRow} key={index}>
                        {evalToColumns(hitEval).map((value, idx) => (
                            <div key={idx}>{value}</div>
                        ))}
                        {round.mode.mode !== "hidden" && round.mode.mode !== "fullHidden" && (
                            <div><ShotArrow hit={hit} /></div>
                        )}
                    </div>
                );
            })}
        </div >
    )
}

function evalToColumns(hitEval: HitEval): Array<string> {
    const columns: Array<string> = [hitEval.id.toString()];
    switch (hitEval.kind) {
        case "rings":
            columns.push(hitEval.rings);
            break;
        case "divider":
            columns.push(hitEval.divider.toString());
            break;
        case "ringsDiv":
            columns.push(hitEval.rings);
            columns.push(hitEval.divider.toString());
            break;
        case "hidden":
            columns.push("***");
            break;
        case "circle":
            columns.push(hitEval.x.toString());
            columns.push(hitEval.y.toString());
            break;
        case "hundred":
            columns.push(hitEval.hundred.toString());
            break;
        case "decimal":
            columns.push(hitEval.decimal.toString());
            columns.push(hitEval.rings);
            break;
        case "integerDecimal":
            columns.push(hitEval.integerTimesDecimal.toString());
            columns.push(hitEval.rings);
            break;
        default:
            const exhaustiveCheck: never = hitEval;
            // @ts-ignore - This is to satisfy the exhaustive check, it should never be reached
            console.warn(`No columns defined for hitEval kind: ${hitEval.kind}`);
    }
    return columns;
}

function getColumns(mode: Mode): Array<string> {
    const columns: Array<string> = ["Nr"];
    switch (mode.mode) {
        case "rings":
        case "target":
            columns.push("Ring");
            break;
        case "divider":
            columns.push("Teiler");
            break;
        case "ringsDiv":
            columns.push("Ring", "Teiler");
            break;
        case "fullHidden":
        case "hidden":
            columns.push("verdeckt");
            break;
        case "circle":
            columns.push("x [mm]", "y [mm]");
            break;
        case "hundred":
            columns.push("100er");
            break;
        case "decimal":
            columns.push("Dezimal");
            columns.push("Ring");
            break;
        case "integerDecimal":
            columns.push("Wert")
            columns.push("Ring");
            break;
        default:
            const exhaustiveCheck: never = mode;
            // @ts-ignore - This is to satisfy the exhaustive check, it should never be reached
            console.warn(`No columns defined for mode: ${mode.mode}`);
            break;
    }
    if (mode.mode !== "hidden" && mode.mode !== "fullHidden") {
        columns.push("Pos");
    }
    return columns;
}