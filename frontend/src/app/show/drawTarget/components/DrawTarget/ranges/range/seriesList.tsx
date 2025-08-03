import ScaleText from "@frontend/app/show/components/ScaleText";
import { getSeries } from "../../../../../lib/ranges";
import styles from "./range.module.css"
import { useAppSelector } from "../../ranges-store/store";

export default function SeriesList({ id }: { id: number }): React.JSX.Element {
    // This only needs to rerender if the hits change, so we can use a simple selector
    const series = useAppSelector((state) => {
        const currentRange = state.ranges[id];
        if (!currentRange || !currentRange.active) return [];
        return getSeries(currentRange);
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
