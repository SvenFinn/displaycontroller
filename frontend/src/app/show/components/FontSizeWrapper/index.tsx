import { useEffect, useRef, useState } from "react";

export function FontSizeWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }): React.JSX.Element {
    const [fontSize, setFontSize] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const handleResize = () => {
        if (ref.current) {
            const newFontSize = ref.current.clientHeight < ref.current.clientWidth ? ref.current.clientHeight : ref.current.clientWidth;
            setFontSize(newFontSize);
        }
    }

    useEffect(() => {
        handleResize();
        const observer = new ResizeObserver(handleResize);
        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        }
    }, []);

    return (
        <div ref={ref} className={className} style={{
            fontSize: `${fontSize}px`, "--container-size": `${fontSize}px`
        } as React.CSSProperties}>
            {children}
        </div>
    );
}
