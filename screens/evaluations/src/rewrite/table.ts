export function removeColumnsFromTable(table: HTMLTableElement, targetHeaders: string[]) {
    const headerRow = table.querySelector<HTMLTableRowElement>("tr");
    if (headerRow == null) {
        return;
    }

    const headers = parseTableHeaders(headerRow);
    const ranges = calculateColumnRanges(headers, targetHeaders);

    for (let i = 0; i < table.rows.length; i++) {
        if (!isDataRow(table.rows[i]) && i !== 0) {
            continue;
        }
        removeColumnsFromRow(table.rows[i], ranges);
    }
}

export function findTableContainingText(document: Document, targetText: string): Array<HTMLTableElement> {
    const tables = document.querySelectorAll("table");
    const upperTargetText = targetText.toUpperCase();
    const matchingTables: Array<HTMLTableElement> = [];

    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const cells = table.querySelectorAll("td, th");
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.textContent?.trim().toUpperCase() === upperTargetText) {
                matchingTables.push(table);
                break;
            }
        }
    }
    return matchingTables;
}

export function removeTableContainingText(document: Document, targetText: string) {
    const tables = findTableContainingText(document, targetText);
    for (let i = 0; i < tables.length; i++) {
        tables[i].remove();
    }
}

function isDataRow(row: HTMLTableRowElement): boolean {
    return Array.from(row.cells).some(cell => cell instanceof row.ownerDocument!.defaultView!.HTMLTableCellElement
        && cell.tagName === "TD");
}

export function separateHeaderAndBody(table: HTMLTableElement) {
    const document = table.ownerDocument!;
    const rows = Array.from(table.rows);
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    let isHeader = true;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (isHeader && isDataRow(row)) {
            isHeader = false;
        }

        if (isHeader) {
            thead.appendChild(row);
        } else {
            tbody.appendChild(row);
        }
    }

    table.innerHTML = "";
    table.appendChild(thead);
    table.appendChild(tbody);
}

type HeaderEntry = {
    text: string;
    start: number;
    span: number;
}

type ColumnRange = {
    start: number;
    end: number;
}

// NOTE: currentIndex tracks logical column position based on original colSpans.
// It must NOT depend on DOM indices, which change when cells are removed.


export function parseTableHeaders(headerRow: HTMLTableRowElement): HeaderEntry[] {
    const headers: HeaderEntry[] = [];
    let currentIndex = 0;

    for (let i = 0; i < headerRow.cells.length; i++) {
        const cell = headerRow.cells[i];
        const span = cell.colSpan || 1;
        headers.push({
            text: cell.textContent?.trim().toUpperCase() || "",
            start: currentIndex,
            span: span,
        });
        currentIndex += span;
    }
    return headers;
}

export function calculateColumnRanges(headers: HeaderEntry[], targetHeaders: string[]): Array<ColumnRange> {
    const ranges: Array<ColumnRange> = [];

    const targetSet = new Set(
        targetHeaders.map(h => h.toUpperCase())
    );

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (targetSet.has(header.text)) {
            ranges.push({
                start: header.start,
                end: header.start + header.span - 1,
            });
        }
    }
    return ranges;
}

export function removeColumnsFromRow(row: HTMLTableRowElement, ranges: Array<ColumnRange>) {
    const cells = Array.from(row.cells);
    let currentIndex = 0;

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const span = cell.colSpan || 1;

        const overlaps = ranges.some((range) => {
            return !(currentIndex + span - 1 < range.start || currentIndex > range.end);
        });

        if (overlaps) {
            cell.remove();
        }

        currentIndex += span;
    }
}
