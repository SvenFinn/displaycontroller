import { FaChevronDown, FaChevronUp, FaXmark } from "react-icons/fa6";
import styles from "./screenList.module.css";
import LocalScreen from "@frontend/app/show/components/LocalScreen";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { deleteScreen, moveScreenDown, moveScreenUp, selectScreen } from "../../store/screensReducer";

export function ScreenListEntry({ id }: { id: number }) {
    const currentScreenId = useAppSelector(state => state.screens.currentScreenId);
    const dispatch = useAppDispatch();

    return (
        <div key={id} className={`${styles.screenListEntry} ${currentScreenId === id ? styles.active : ""}`} onClick={() => dispatch(selectScreen(id))}>
            <ScreenListEntryContent id={id} />
        </div >
    );
}

function ScreenListEntryContent({ id }: { id: number }) {
    const screen = useAppSelector(state => state.screens.screens.find(s => s.id === id)!);
    const dispatch = useAppDispatch();

    return <>
        <FaChevronUp className={styles.moveUp} onClick={() => dispatch(moveScreenUp(screen.id))} />
        <FaChevronDown className={styles.moveDown} onClick={() => dispatch(moveScreenDown(screen.id))} />
        <FaXmark className={styles.delete} onClick={() => dispatch(deleteScreen(screen.id))} />
        <div className={styles.overlay} onClick={() => dispatch(selectScreen(id))} />
        <LocalScreen screen={screen} key={id} />
    </>;
}