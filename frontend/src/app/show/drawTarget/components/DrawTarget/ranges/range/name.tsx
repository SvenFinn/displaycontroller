import ScaleText from "../../../../../components/ScaleText";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./range.module.css";

export default function Name({ id }: { id: number }): React.JSX.Element {
    const shooterName = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active && range.shooter) {
            return `${range.shooter.firstName} ${range.shooter.lastName}`;
        }
        return "- - - Frei - - -";
    });
    return (
        <div className={styles.rangeName}>
            <ScaleText text={shooterName} />
        </div>
    )
}