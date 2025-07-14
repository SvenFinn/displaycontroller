import ScaleText from "@frontend/app/show/components/ScaleText";
import { getSeries } from "../../../../../lib/ranges";
import styles from "./range.module.css"
import { Range } from "dc-ranges-types";

export default function SeriesList({ range }: { range: Range }): React.JSX.Element {
    const series = getSeries(range);
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
