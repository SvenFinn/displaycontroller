import ScaleText from "@frontend/app/show/components/ScaleText";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";


export default function InfoStr({ id }: { id: number }): React.JSX.Element {
    const zoom = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active && range.discipline && range.round !== undefined) {
            return range.discipline.rounds[range.round]?.zoom || undefined;
        }
        return undefined;
    });
    const hitsPerView = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active && range.discipline && range.round !== undefined) {
            return range.discipline.rounds[range.round]?.hitsPerView || "?";
        }
        return "?";
    });
    const ip = useAppSelector((state) => {
        const range = state.ranges[id];
        if (range && range.active) {
            return range.ipAddress || "";
        }
        return "";
    });

    let zoomStr = "Z?";
    if (zoom !== undefined) {
        switch (zoom.mode) {
            case "none":
                zoomStr = "Z0";
                break;
            case "auto":
                zoomStr = "ZA";
                break;
            case "fixed":
                zoomStr = `Z${zoom.value}`;
                break;
        }
    }

    return (
        <div className={styles.rangeStr}><ScaleText text={`${ip} - S${hitsPerView}:${zoomStr}`} /></div>
    );
}