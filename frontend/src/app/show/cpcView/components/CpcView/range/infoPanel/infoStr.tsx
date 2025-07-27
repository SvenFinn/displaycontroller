import ScaleText from "@frontend/app/show/components/ScaleText";
import { useAppSelector } from "../../ranges-store/store";
import styles from "./infoPanel.module.css";


export default function InfoStr({ id }: { id: number }): React.JSX.Element {
    const range = useAppSelector(state => state.ranges[id]);
    if (!range) return <></>;
    if (!range.active) return <></>;

    const zoom = range.discipline?.rounds[range.round]?.zoom;
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
        <div className={styles.rangeStr}><ScaleText text={`${range.ipAddress || ""} - S${range.discipline?.rounds[range.round]?.hitsPerView || "?"}:${zoomStr}`} /></div>
    );
}
