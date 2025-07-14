import styles from "./range.module.css"
import RangeNr from "./rangeNr"
import RangeName from "./name"
import { useAppSelector } from "../../ranges-store/store"
import CurrentHit from "./currentHit"
import DrawRange from "./drawRange"
import SeriesList from "./seriesList"
import Total from "./total"
import { Shooter } from "dc-ranges-types"
import { useEffect, useState, useRef } from "react"

interface DrawTargetRangeProps {
    highlightAssign: boolean,
    id: number
}

export default function Range({ highlightAssign, id }: DrawTargetRangeProps): React.JSX.Element {
    const range = useAppSelector((state) => state.ranges[id]);
    const [lastShooter, setLastShooter] = useState<null | Shooter>(null);
    const firstActiveRender = useRef(true);
    const rangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rangeRef.current) return;
        if (!range || !range.active) {
            rangeRef.current.style.animation = "none";
            firstActiveRender.current = true;
            return;
        }
        // Prevent highlight on the first render after the range is activated
        if (firstActiveRender.current) {
            firstActiveRender.current = false;
            setLastShooter(range.shooter);
            return;
        }
        if (highlightAssign) {
            if (range.shooter !== null && JSON.stringify(range.shooter) !== JSON.stringify(lastShooter)) {
                setLastShooter(range.shooter);
                rangeRef.current.style.animation = "none";
                setTimeout(() => {
                    if (!rangeRef.current) return;
                    rangeRef.current.style.animation = "";
                }, 10);
            }
        }
    }, [range, highlightAssign])

    if (id < 1 || !range || !range.active) return (
        <div></div>
    )

    return (
        <div className={styles.range} style={{ animation: "none" }} ref={rangeRef}>
            <RangeNr id={id} />
            <RangeName shooter={range.shooter} />
            <CurrentHit range={range} />
            <DrawRange range={range} />
            <SeriesList range={range} />
            <Total range={range} />
        </div>
    )
}