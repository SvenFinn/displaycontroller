import fs from "fs";

export const replacementCss = fs.readFileSync(`${__dirname}/replacement.css`).toString();
export const clientScript = fs.readFileSync(`${__dirname}/client-script.js`).toString();

export function addStylesToHead(document: Document) {
    const head = document.querySelector("head")!;
    const style = document.createElement("style");
    style.innerHTML = replacementCss;
    head.appendChild(style);
}

export function addScriptToHead(document: Document) {
    const head = document.querySelector("head")!;
    const script = document.createElement("script");
    script.innerHTML = clientScript;
    head.appendChild(script);
}