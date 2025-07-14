import styles from "./invalidScreen.module.css";


export default function InvalidScreen({ id, preset }: { id: number, preset: string }) {
    return (
        <div className={styles.invalidScreen}>
            <h1>Ansicht {id} konnte nicht verarbeitet werden</h1>
            <p>Die Ansicht {id} - {preset} konnte nicht geladen werden.</p>
            <p>Um das Problem zu beheben, öffne die Konfigurationsseite der Ansicht. Dort kann sie repariert oder gelöscht werden.</p>
        </div >
    )
}