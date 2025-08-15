import { DbScreen } from "dc-screens-types";

export function getDefaultOptions(screen: DbScreen): DbScreen {
    switch (screen.type) {
        case "cpcView":
            return {
                ...screen,
                type: "cpcView",
                options: {
                    columns: 1,
                    rows: 1,
                    ranges: [],
                }
            };
        case "drawTarget":
            return {
                ...screen,
                type: "drawTarget",
                options: {
                    columns: 1,
                    rows: 1,
                    ranges: [],
                    highlightAssign: false,
                }
            };
        case "imageViewer":
        case "evaluation":
            return {
                ...screen,
                type: screen.type,
                options: {
                    path: "",
                }
            };
        case "embed":
            return {
                ...screen,
                type: "embed",
                options: {
                    url: "",
                }
            };
    }
    return screen // Fallback, should not happen
}