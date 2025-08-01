import { Range } from "dc-ranges-types";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";
import { getHitString } from "@frontend/app/show/lib/ranges";
import ShotArrow from "@frontend/app/show/components/Ranges/Arrow";
import React from "react";


export default function ShotTable({ id }: { id: number }): React.JSX.Element {

    const range = useAppSelector(state => state.ranges[id]);
    if (!range) return <></>;
    if (!range.active) return <></>;
    if (!range.discipline) return <></>;

    const hits = range.hits?.[range.round] || [];
    const round = range.discipline.rounds[range.round];
    if (!round) return <></>;
    const mode = round.mode.mode;

    const currentSumCount = hits.length % round.hitsPerSum || round.hitsPerSum;
    const selectedHits = currentSumCount > 10 ? hits.slice(-10) : hits.slice(-currentSumCount);

    return (
        <div className={styles.shotTable} >
            <table>
                <thead>
                    <tr>
                        {getColumns(range).map((col, index) => (
                            <th key={index}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {selectedHits.reverse().map((hit, index) => {
                        const hitStrings = getHitString(range, range.round, hit);
                        if (!hitStrings) return null;
                        return (
                            <tr key={index}>
                                {hitStrings.map((value, idx) => (
                                    <td key={idx}>{value}</td>
                                ))}
                                {mode !== "hidden" && mode !== "fullHidden" && (
                                    <ShotArrow hitIndex={index} range={range} />
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}

function getColumns(range: Range): Array<string> {
    if (!range.active) return [];
    if (!range.discipline) return [];
    const mode = range.discipline.rounds[range.round]?.mode.mode;
    if (!mode) return [];
    const columns: Array<string> = ["Nr"];
    switch (mode) {
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
            break;
    }
    if (mode !== "hidden" && mode !== "fullHidden") {
        columns.push("Pos");
    }
    return columns;
}