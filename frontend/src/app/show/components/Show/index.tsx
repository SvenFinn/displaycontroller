
import Background from '../Background';
import Clock from '../Clock';
import FullscreenButton from '../Fullscreen';
import Logo from '../Logo';
import ServerState from '../ServerEvents/serverState';
import styles from './show.module.css';


export default function Show({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <div className={styles.show}>
            <Background />
            <div className={styles.content}>
                {children}
            </div>
            <FullscreenButton />
            <Clock />
            <Logo />
            <ServerState />

        </div >
    )
}
