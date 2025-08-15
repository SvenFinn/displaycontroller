import LocalScreen from "@frontend/app/show/components/LocalScreen";
import styles from "./preview.module.css";
import { DbScreen } from "dc-screens-types";

export function Preview({ screen }: { screen: DbScreen | null }) {
    if (!screen) {
        return <></>;
    }
    return (
        <>
            <h2>Vorschau</h2>
            <LocalScreen screen={screen} mode="parallel" className={styles.preview} />
        </>
    );
}