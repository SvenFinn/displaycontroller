import ScaleText from "@frontend/app/show/components/ScaleText";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";


export function RoundName({ id }: { id: number }): React.JSX.Element {
    const roundName = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active && range.discipline && range.round !== undefined) {
            return range.discipline.rounds[range.round]?.name || "";
        }
        return "";
    });
    return (
        <div className={styles.round}><ScaleText text={roundName} /></div>
    );
}
