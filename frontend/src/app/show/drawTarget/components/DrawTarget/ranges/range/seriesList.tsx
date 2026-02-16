import styles from "./range.module.css"
import { useAppSelector } from "../../ranges-store/store";
import { ScaleText } from "@frontend/app/components/base/ScaleText";
import { getSeries } from "@frontend/app/show/lib/ranges/accumulate";

export default function SeriesList({ id }: { id: number }): React.JSX.Element {
    // This only needs to rerender if the hits change, so we can use a simple selector
    const series = useAppSelector((state) => {
        const currentRange = state.ranges[id];
        if (!currentRange || !currentRange.active || !currentRange.discipline) return [];
        const round = currentRange.discipline.rounds[currentRange.round];
        const hits = currentRange.hits[currentRange.round];
        const series = getSeries(round, currentRange.discipline.gauge, hits || []);
        if (series.length > 12) {
            // Remove so many multiples of 4 from the front until we have at most 12 entries
            const excess = series.length - 12;
            const toRemove = Math.ceil(excess / 4) * 4;
            return series.slice(toRemove);
        }
        return series;
    });

    const rows = Math.ceil(series.length / 4);
    return (
        <table className={styles.seriesList}>
            <tbody>
                {Array.from({ length: rows }, (_, i) => (
                    <tr key={i}>
                        {Array.from({ length: 4 }, (_, j) => {
                            const index = i * 4 + j;
                            if (index >= series.length) return (<td key={j} className={styles.empty} />)
                            const value = series[index];
                            return (
                                <td key={j}>
                                    <ScaleText text={value} />
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
