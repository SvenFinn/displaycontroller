import { DisciplineLayoutCustom } from "@shared/ranges/discipline/layout";

export function getCustomLayout(layoutId: number): DisciplineLayoutCustom | undefined {
    switch (layoutId) {
        case 9000: // chess 6x6 lg
            return {
                mode: "chess",
                type: "rifle",
                columns: 6,
                rows: 6
            };
        case 9001: // chess 6x6 lp
            return {
                mode: "chess",
                type: "pistol",
                columns: 6,
                rows: 6
            };
        case 9003: // chess 5x5 lg
            return {
                mode: "chess",
                type: "rifle",
                columns: 5,
                rows: 5
            };
        case 9004: // chess 5x5 lp
            return {
                mode: "chess",
                type: "pistol",
                columns: 5,
                rows: 5
            };
        case 9005: // chess 7x7 lg
        case 9007:
            return {
                mode: "chess",
                type: "rifle",
                columns: 7,
                rows: 7
            };
        case 9006: // chess 7x7 lp
        case 9008:
            return {
                mode: "chess",
                type: "pistol",
                columns: 7,
                rows: 7
            };
        case 9010: // chess 10x10 lg
            return {
                mode: "chess",
                type: "rifle",
                columns: 10,
                rows: 10
            };
        case 9011: // chess 10x10 lp
            return {
                mode: "chess",
                type: "pistol",
                columns: 10,
                rows: 10
            };
        case 9901: // dart lg
            return {
                mode: "dart",
                type: "rifle"
            };
        case 9902: // dart lp
            return {
                mode: "dart",
                type: "pistol"
            };
        case 9910: // stars lg
            return {
                mode: "stars",
                type: "rifle"
            };
        case 9911: // stars lp
            return {
                mode: "stars",
                type: "pistol"
            };
        case 9912: // easter lg
        case 9913:
            return {
                mode: "easter",
            };
        default:
            return undefined;
    }
}