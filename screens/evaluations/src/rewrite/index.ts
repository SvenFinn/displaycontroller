import { JSDOM } from "jsdom";
import { logger } from "dc-logger";
import { removeColumnsFromTable, separateHeaderAndBody } from "./table";
import { addScriptToHead, addStylesToHead } from "./assets";
import { promises as fs } from "fs";
import path from "path";

export async function rewriteHTML(inputBase: string, outputBase: string) {
    logger.info(`Rewriting HTML files from ${inputBase} to ${outputBase}`);
    await rewriteHTMLRecursive(inputBase, outputBase);
}

async function rewriteHTMLRecursive(
    inputBase: string,
    outputBase: string,
    folder = ""
): Promise<void> {
    const inputDir = path.join(inputBase, folder);
    const outputDir = path.join(outputBase, folder);

    // Clean output directory
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(outputDir, { recursive: true });

    const entries = await fs.readdir(inputDir, { withFileTypes: true });

    for (const entry of entries) {
        const inputPath = path.join(inputDir, entry.name);
        const outputPath = path.join(outputDir, entry.name);

        if (entry.isDirectory()) {
            logger.debug(`Recursing into ${inputPath}`);
            await rewriteHTMLRecursive(inputBase, outputBase, path.join(folder, entry.name));
        } else {
            logger.debug(`Rewriting ${inputPath}`);
            await rewriteHTMLFile(inputPath, outputPath);
        }
    }
}

async function rewriteHTMLFile(inputFile: string, outputFile: string): Promise<void> {
    if (!inputFile.toLowerCase().endsWith(".html")) {
        logger.warn(`Skipping non-HTML file: ${inputFile}`);
        return;
    }
    const fileContent = await fs.readFile(inputFile, "utf-8");
    const dom = new JSDOM(fileContent);
    const document = dom.window.document;

    removeAllNodesOfType(document, "style");
    removeAllNodesOfType(document, "script");
    removeAllNodesOfType(document, "img");

    addStylesToHead(document);
    addScriptToHead(document);

    const p = document.querySelectorAll("p");
    for (let i = 0; i < p.length; i++) {
        if (p[i].textContent.trim() === "") {
            p[i].remove();
        }
    }

    const resultsTable = document.querySelector<HTMLTableElement>("table.result")!;
    const body = dom.window.document.querySelector("body")!;

    separateHeaderAndBody(resultsTable);

    const footerDiv = document.createElement("div");
    footerDiv.classList.add("footer");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    let node = resultsTable.nextSibling;
    while (node) {
        const next = node.nextSibling;
        footerDiv.appendChild(node);
        node = next;
    }

    // Move remaining body children into content
    while (body.firstChild) {
        contentDiv.appendChild(body.firstChild);
    }

    body.innerHTML = "";
    body.appendChild(contentDiv);
    body.appendChild(footerDiv);

    // Remove SNr, PNr, ID, Bemerkung from result table
    const colsToRemove = ["PNr", "ID", "MannschaftsNrPassNr"];
    removeColumnsFromTable(resultsTable, colsToRemove)

    // Export file
    const htmlText = dom.serialize();

    await fs.writeFile(outputFile, htmlText);
}

function removeAllNodesOfType(document: Document, tagName: string) {
    const elements = document.getElementsByTagName(tagName.toUpperCase());
    for (let i = elements.length - 1; i >= 0; i--) {
        elements[i].remove();
    }
}