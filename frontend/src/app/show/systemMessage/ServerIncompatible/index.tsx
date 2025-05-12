import styles from "./serverIncompatible.module.css";


export default function ServerIncompatibleMessage({ serverVersion }: { serverVersion: string }): React.JSX.Element {
    const minVersion = process.env.NEXT_PUBLIC_MIN_MEYTON_VERSION;
    const maxVersion = process.env.NEXT_PUBLIC_MAX_MEYTON_VERSION;
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
    return (
        <div className={styles.serverIncompatible}>
            <h1>Meyton-Server inkompatibel</h1>
            <p>Die Version des Meyton-Servers (ShootMaster {serverVersion}) ist nicht mit der installierten Version des Displaycontrollers ({appVersion}) kompatibel.</p>
            <p>Die aktuell installierte Version des Displaycontrollers unterstützt die Versionen {minVersion} bis {maxVersion} des ShootMaster-Systems.</p>
            <p>Versuchen Sie, den Displaycontroller gegebenenfalls auf eine neuere Version zu aktualisieren.</p>
        </div>
    )
}