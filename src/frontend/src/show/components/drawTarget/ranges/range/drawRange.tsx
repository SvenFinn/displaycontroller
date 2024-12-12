import DrawRange from "../../../parts/rangeDraw"
import { useAppSelector } from "../../ranges-store/store";
import styles from "./range.module.css";
import { useEffect, useRef, useState } from "react";


interface DrawRangeProps {
    id: number
}

export default function DrawRangeW({ id }: DrawRangeProps): JSX.Element {
    const range = useAppSelector((state) => state.ranges[id]);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        updateMaxHeight();
        window.addEventListener("resize", updateMaxHeight)
        function updateMaxHeight() {
            if (!ref.current) return;
            // Compute the total height of the ranges container
            // and compensate if it is larger than the height it should be
            const cont = ref.current.parentElement;
            if (!cont) return;
            const containerHeight = cont.clientHeight;
            let contentHeight = 0;
            for (let i = 0; i < cont.children.length; i++) {
                if (cont.children[i] === ref.current) {
                    continue;
                }
                // @ts-expect-error help me
                contentHeight += cont.children[i].offsetHeight;
            }
            setMaxHeight((containerHeight - contentHeight) * 0.95);
        }

        return () => {
            window.removeEventListener("resize", updateMaxHeight);
        }
    });

    if (!range) return <></>

    return (
        <div ref={ref} className={styles.drawRange} style={{
            maxHeight: maxHeight
        }}>
            <DrawRange range={range} className={styles.drawRange} />
        </div>
    )
}