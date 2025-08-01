import ScaleText from "../../../../../components/ScaleText";
import styles from "./range.module.css";
import { useAppSelector } from "../../ranges-store/store";
import { Shooter } from "@shared/ranges/shooter";

export default function Name({ shooter }: { shooter: Shooter | null }): React.JSX.Element {
    const name = shooter ? `${shooter.firstName} ${shooter.lastName}` : "- - - Frei - - -";
    return (
        <div className={styles.rangeName}>
            <ScaleText text={name} />
        </div>
    )
}