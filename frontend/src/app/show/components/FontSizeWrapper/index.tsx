import { useEffect, useRef, useState } from "react";

export function FontSizeWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }): React.JSX.Element {
    const [fontSize, setFontSize] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const handleResize = () => {
        if (ref.current) {
            const newFontSize = ref.current.clientHeight;
            setFontSize(newFontSize);
        }
    }

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
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
