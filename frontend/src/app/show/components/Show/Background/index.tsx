"use client";

import image from "./background.png"
import style from "./background.module.css"

export default function Background() {
    return (
        <div className={style.background}>
            <img src={image.src} alt="Background" className={style.background} />
        </div>
    )
}