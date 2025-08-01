"use client";

import { Range } from "dc-ranges-types";
import DrawRange from "../../../../../components/Ranges/Draw"
import styles from "./range.module.css";
import { useEffect, useRef, useState } from "react";


interface DrawRangeProps {
    range: Range
}

export default function DrawRangeW({ range }: DrawRangeProps): React.JSX.Element {
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
                contentHeight += (cont.children[i] as HTMLElement).offsetHeight;
            }
            setMaxHeight((containerHeight - contentHeight) * 0.95);
        }

        return () => {
            window.removeEventListener("resize", updateMaxHeight);
        }
    });

    return (
        <div ref={ref} className={styles.drawRange} style={{
            maxHeight: maxHeight
        }}>
            <DrawRange range={range} className={styles.drawRange} />
        </div>
    )
}