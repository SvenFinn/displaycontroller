import { useAppSelector } from "../../ranges-store/store";
import ScaleText from "@frontend/app/show/components/ScaleText";
import styles from "./infoPanel.module.css";


export function DisciplineName({ id }: { id: number }): React.JSX.Element {
    const disciplineName = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active && range.discipline) {
            return range.discipline.name;
        }
        return "";
    });
    return (
        <div className={styles.discipline}> <ScaleText text={disciplineName} /></div>
    )
}