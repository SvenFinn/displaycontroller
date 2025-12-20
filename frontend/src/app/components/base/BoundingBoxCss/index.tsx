import { useResizeObserver } from "@frontend/app/hooks/useResizeObserver";
import { ComponentPropsWithoutRef, ComponentPropsWithRef, useRef } from "react";
import styles from "./boundingBoxCss.module.css";

export function BoundingBoxCss({ children, ...rest }: ComponentPropsWithoutRef<"div">): React.ReactNode {
    const ref = useRef<HTMLDivElement | null>(null);

    useResizeObserver(ref, () => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        if (!rect) return;
        ref.current.style.setProperty("--width", `${rect.width}px`);
        ref.current.style.setProperty("--height", `${rect.height}px`);
    });
    return (
        <div ref={ref} {...rest} > {children} </div>
    )
}

interface HeightAsFontSizeProps
    extends ComponentPropsWithRef<"div"> {
    contentClassName?: string;
    contentStyle?: React.CSSProperties;
}

export function HeightAsFontSize({
    children,
    className,          // layout context
    style,              // layout styles
    contentClassName,   // visual styles
    contentStyle,       // visual styles
    ...rest
}: HeightAsFontSizeProps) {
    return (
        <BoundingBoxCss className={`${styles.outer} ${className || ""}`} style={style} {...rest}>
            <div
                className={`${styles.inner} ${contentClassName || ""}`}
                style={{
                    fontSize: "calc(var(--height, 0px) * var(--font-height-ratio))",
                    ...contentStyle,
                }}
            >
                {children}
            </div>
        </BoundingBoxCss>
    );
}



