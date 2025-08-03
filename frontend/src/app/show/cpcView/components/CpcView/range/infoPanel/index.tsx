import { Range } from "dc-ranges-types";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";
import SeriesTable from "./seriesTable";
import ShotTable from "./shotTable";
import { getTotal } from "@frontend/app/show/lib/ranges";
import ModeIcon from "./icon";
import ScaleText from "@frontend/app/show/components/ScaleText";
import InfoStr from "./infoStr";
import { DisciplineName } from "./disciplineName";
import { RoundName } from "./roundName";
import { HitTotal } from "./hitTotal";


export default function InfoPanel({ id }: { id: number }): React.JSX.Element {
    const shouldRender = useAppSelector(state => state.ranges[id]?.active || false);
    if (!shouldRender) {
        return <></>;
    }

    return (
        <div className={styles.infoPanel}>
            <DisciplineName id={id} />
            <RoundName id={id} />
            <div className={styles.total}>
                <ModeIcon id={id} className={styles.icon} />
                <HitTotal id={id} />

            </div>
            <div className={styles.shotInfo}>
                <ShotTable id={id} />
                <SeriesTable id={id} />
                <InfoStr id={id} />
            </div>
        </div>
    )
}