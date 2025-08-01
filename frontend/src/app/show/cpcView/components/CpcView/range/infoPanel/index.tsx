import { Range } from "dc-ranges-types";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";
import SeriesTable from "./seriesTable";
import ShotTable from "./shotTable";
import { getTotal } from "@frontend/app/show/lib/ranges";
import ModeIcon from "./icon";
import ScaleText from "@frontend/app/show/components/ScaleText";
import InfoStr from "./infoStr";


export default function InfoPanel({ id }: { id: number }): React.JSX.Element {
    const range = useAppSelector(state => state.ranges[id]);
    if (!range) return <></>;
    if (!range.active) return <></>;

    return (
        <div className={styles.infoPanel}>
            <div className={styles.discipline}> <ScaleText text={range.discipline && range.discipline.name || ""} /></div>
            <div className={styles.round}><ScaleText text={range.discipline?.rounds[range.round]?.name || ""} /></div>
            <div className={styles.total}>
                <ModeIcon range={range} className={styles.icon} />
                <span className={styles.value}>{getTotal(range)}</span>
            </div>
            <div className={styles.shotInfo}>
                <ShotTable id={id} />
                <SeriesTable id={id} />
                <InfoStr id={id} />
            </div>
        </div>
    )
}