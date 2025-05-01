import { useEffect, useRef } from "react";
import ActionButtons from "../../Actions/Buttons";
import { InternalActions } from "../../Actions/hook";
import styles from "./ContextMenu.module.css";


type ContextMenuProps = {
    selectedFiles: string[];
    currentPath: string;
    actions: InternalActions;
    position: { x: number; y: number };
}

export default function ContextMenu({ selectedFiles, currentPath, actions, position }: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const height = ref.current?.clientHeight || 0;
        const width = ref.current?.clientWidth || 0;
        const parentWidth = ref.current?.parentElement?.clientWidth || 0;
        const parentHeight = ref.current?.parentElement?.clientHeight || 0;
        const x = position.x + width > parentWidth ? parentWidth - width : position.x;
        const y = position.y + height > parentHeight ? parentHeight - height : position.y;

        if (ref.current) {
            ref.current.style.left = `${x}px`;
            ref.current.style.top = `${y}px`;
        }
    }, [position, ref]);


    return (
        <div className={styles.contextMenu} style={{ top: position.y, left: position.x }} ref={ref}>
            <ActionButtons selectedFiles={selectedFiles} currentPath={currentPath} actions={actions} />
        </div>
    )
}