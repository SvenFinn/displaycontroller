"use client";

import { useEffect, useState } from 'react';
import styles from './logo.module.css';

export default function Logo(): React.JSX.Element {
    const [host, setHost] = useState<string>("");

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (host === "") {
        return <></>;
    }
    return (
        <img src={`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/images/icon.png`} alt="Logo" className={styles.logo} />
    );
}