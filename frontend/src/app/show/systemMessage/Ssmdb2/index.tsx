import ssmdb2 from "./ssmdb2.png";
import styles from "./ssmdb2.module.css";


export default function Ssmdb2Message(): React.JSX.Element {
    return (
        <div className={styles.ssmdb2}>
            <h1>Bitte SSMDB2 aktivieren</h1>
            <p>Der Displaycontroller verwendet die SSMDB2, um Schießergebnisse darstellen zu können.</p>
            <p>Bitte aktivieren Sie die SSMDB2 im ShootMaster-Kontrollzentrum</p>
            <img src={ssmdb2.src} alt="SSMDB2" />
        </div>
    )
}