import { getSeries } from "@frontend/app/show/lib/ranges";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";

export default function SeriesTable({ id }: { id: number }): React.JSX.Element {
    const series = useAppSelector(state => {
        const range = state.ranges[id];
        if (!range || !range.active || !range.discipline) return [];
        return getSeries(range.discipline.rounds[range.round], range.discipline.gauge, range.hits[range.round] || []);

    })
    if (!series) return <></>;

    const cols = series.length > 9 ? 4 : 3;
    const rows = series.length > 6 ? 3 : 2;
    const total = cols * rows;

    const visibleSeries = series.slice(-total);

    return (
        <div className={styles.seriesTable} style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            fontSize: `${100 / rows}%`
        }}>
            {
                visibleSeries.map((value, index) => (
                    <div key={index} className={styles.seriesCell}>
                        {value}
                    </div>
                ))
            }
        </div>
    );
}