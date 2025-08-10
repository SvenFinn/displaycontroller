import { useAppSelector } from "../ranges-store/store";
import styles from "./range.module.css";
import InfoPanel from "./infoPanel";
import { RangeView } from "./rangeView";
import { SizeWrapper } from "@frontend/app/show/components/SizeWrapper";

interface CpcViewRangeProps {
    id: number | null;
}

export default function CpcViewRange({ id }: CpcViewRangeProps): React.JSX.Element {
    if (!id) {
        return <div className={styles.range}></div>; // Return an empty div if id is null
    }

    return (
        <SizeWrapper className={styles.range}>
            <InfoPanel id={id} />
            <RangeView id={id} />
        </SizeWrapper>

    );
}