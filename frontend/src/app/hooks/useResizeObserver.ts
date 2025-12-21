import { useEffect, useLayoutEffect, useRef } from "react";

export function useResizeObserver(
    ref: React.RefObject<Element | null>,
    cb: (entry: ResizeObserverEntry) => void
) {
    const cbRef = useRef(cb);
    cbRef.current = cb;

    useLayoutEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(entries => {
            if (entries[0]) cbRef.current(entries[0]);
        });
        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref]);
}