import { getSeries } from "@frontend/app/show/lib/ranges";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";

export default function SeriesTable({ id }: { id: number }): React.JSX.Element {
    const range = useAppSelector(state => state.ranges[id]);
    if (!range) return <></>;

    const series = getSeries(range);
    if (!series || series.length === 0) return <></>;

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