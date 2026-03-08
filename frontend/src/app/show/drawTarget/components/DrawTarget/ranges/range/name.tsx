import { ScaleText } from "@frontend/app/components/base/ScaleText";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./range.module.css";

export default function Name({ id }: { id: number }): React.JSX.Element {
    const shooterName = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active && range.shooter) {
            if (range.shooter.type === "free") {
                return "- - - Frei - - -";
            }
            return `${range.shooter.firstName} ${range.shooter.lastName}`;
        }
        return "Nicht identifizierbar";
    });
    return (
        <div className={styles.rangeName}>
            <ScaleText text={shooterName} />
        </div>
    )
}