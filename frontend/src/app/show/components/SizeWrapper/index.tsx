import { forwardRef, useEffect, useRef, useState } from "react";
import { ComponentPropsWithoutRef } from "react";
import styles from "./sizeWrapper.module.css";

// helper to merge multiple refs into one
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
    return (value: T) => {
        refs.forEach((ref) => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(value);
            } else {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}

type SizeWrapperProps = ComponentPropsWithoutRef<"div">;

export const SizeWrapper = forwardRef<HTMLDivElement, SizeWrapperProps>(
    ({ children, className, style, ...rest }, forwardedRef) => {
        const [size, setSize] = useState(0);
        const localRef = useRef<HTMLDivElement>(null);

        const handleResize = () => {
            if (localRef.current) {
                const { clientHeight, clientWidth } = localRef.current;
                const newFontSize = Math.min(clientHeight, clientWidth);
                setSize(newFontSize);
            }
        };

        useEffect(() => {
            handleResize();
            const observer = new ResizeObserver(handleResize);
            if (localRef.current) {
                observer.observe(localRef.current);
            }
            return () => observer.disconnect();
        }, []);

        return (
            <div
                ref={mergeRefs(localRef, forwardedRef)}
                className={`${styles.sizeWrapper} ${className || ""}`}
                style={
                    {
                        ...style,
                        "--container-size": `${size}px`,
                    } as React.CSSProperties
                }
                {...rest}
            >
                {children}
            </div>
        );
    }
);

export default SizeWrapper;
