import ScaleText from "@frontend/app/show/components/ScaleText";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./rangeView.module.css";
import DrawRange from "@frontend/app/show/components/Ranges/Draw";

export function RangeView({ id }: { id: number }): React.JSX.Element {
    const range = useAppSelector(state => state.ranges[id]);
    if (!range) return <></>;
    if (!range.active) return <></>;
    let shooterName = "- - - Frei - - -";
    if (range.shooter) {
        shooterName = `${range.shooter.lastName}, ${range.shooter.firstName}`;
    }

    return (
        <div className={styles.rangeView}>
            <div className={styles.shooterName}><ScaleText text={shooterName} /></div>
            <div className={styles.rangeId}>
                {id}
            </div>
            <DrawRange range={range} className={styles.rangeDraw} />
        </div>
    )
}