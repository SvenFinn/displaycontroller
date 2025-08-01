"use client";

import { useEffect, useState } from 'react';
import styles from './logo.module.css';
import { useHost } from '@frontend/app/hooks/useHost';

export default function Logo(): React.JSX.Element {
    const [cacheBlock, setCacheBlock] = useState<number>(0);
    const host = useHost();


    const logo = `${host}/api/images/icon.png?cache=${cacheBlock}`;

    function onImageError(event: React.SyntheticEvent<HTMLImageElement, Event>) {
        if (event.currentTarget.naturalHeight === 0 && event.currentTarget.naturalWidth === 0) {
            setTimeout(() => setCacheBlock(Date.now()), 1000);
        }
    }

    return (
        <img key={cacheBlock} src={logo} alt="Logo" className={styles.logo} onError={onImageError} />
    );
}