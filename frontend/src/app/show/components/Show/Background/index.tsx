"use client";

import image from "./background.png"
import style from "./background.module.css"
import Image from "next/image";

export default function Background() {
    return (
        <div className={style.background}>
            <Image src={image} alt="Background" className={style.background} priority sizes="100vw" placeholder="blur" />
        </div>
    )
}