import styles from "./smdbAccess.module.css";

export default function SmdbAccess(): React.JSX.Element {
    return (
        <div className={styles.smdbAccess}>
            <h1>SMDB nicht verfügbar</h1>
            <p>Der Displaycontroller kann keine Verbindung zur ShootMaster-Datenbank herstellen</p>
            <p>Seit ShootMaster-Version 5.3.0 ist die ShootMaster-Datenbank (SMDB) für Drittsoftware nicht mehr verfügbar. Der Displaycontroller benötigt Daten aus der ShootMaster-Datenbank, um zu arbeiten.</p>
            <p><a href="/help/smdbAccess">Hier</a> finden Sie weitere Informationen.</p>
        </div>
    )
}