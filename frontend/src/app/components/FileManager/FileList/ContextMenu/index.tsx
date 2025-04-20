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
    return (
        <div className={styles.contextMenu} style={{ top: position.y, left: position.x }}>
            <ActionButtons selectedFiles={selectedFiles} currentPath={currentPath} actions={actions} />
        </div>
    )
}