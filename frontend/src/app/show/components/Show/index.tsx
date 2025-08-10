"use client";

import Background from './Background';
import Clock from './Clock';
import FullscreenButton from './Fullscreen';
import Logo from './Logo';
import ServerState from '../ServerEvents/serverState';
import styles from './show.module.css';
import { useRef, useState } from 'react';
import { SizeWrapper } from '../SizeWrapper';


export default function Show({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    return (
        <SizeWrapper className={styles.show} ref={(el) => setContainer(el)}>
            <Background />
            <div className={styles.content}>
                {children}
            </div>
            <FullscreenButton container={container} />
            <Clock />
            <Logo />
            <ServerState />
        </SizeWrapper>
    )
}
