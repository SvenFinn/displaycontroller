"use client";

import Background from './Background';
import Clock from './Clock';
import FullscreenButton from './Fullscreen';
import Logo from './Logo';
import styles from './show.module.css';
import { useRef, useState } from 'react';
import ServerState from '../ServerEvents/serverState';
import { HeightAsFontSize } from '@frontend/app/components/base/BoundingBoxCss';


export default function Show({ children }: { children: React.ReactNode }): React.JSX.Element {
    const ref = useRef<HTMLDivElement | null>(null);

    return (
        <HeightAsFontSize className={styles.show} ref={ref}>
            <Background />
            <div className={styles.content}>
                {children}
            </div>
            <FullscreenButton container={ref} />
            <Clock />
            <Logo />
            <ServerState />
        </HeightAsFontSize>
    )
}
