import { LayoutGames } from "@shared/ranges/discipline/layout/games";
import { LayoutRectangle } from "@shared/ranges/discipline/layout/rectangle";

export function getCustomLayout(layoutId: number): LayoutGames | LayoutRectangle | undefined {
    switch (layoutId) {
        case 1410: // 5.5x90
            return {
                mode: "rectangle",
                x: -2.75,
                y: -45,
                width: 5.5,
                height: 90,
            };
        case 1411: // 90x5.5
            return {
                mode: "rectangle",
                x: -45,
                y: -2.75,
                width: 90,
                height: 5.5,
            };
        case 1420: // 6x30.5
            return {
                mode: "rectangle",
                x: -3,
                y: -15.25,
                width: 6,
                height: 30.5,
            };
        case 1421: // 30.5x6
            return {
                mode: "rectangle",
                x: -15.25,
                y: -3,
                width: 30.5,
                height: 6,
            };
        case 1430: // 9x30.5
            return {
                mode: "rectangle",
                x: -4.5,
                y: -15.25,
                width: 9,
                height: 30.5,
            };
        case 1431: // 30.5x9
            return {
                mode: "rectangle",
                x: -15.25,
                y: -4.5,
                width: 30.5,
                height: 9,
            };
        case 1445: // 90 x 90
            return {
                mode: "rectangle",
                x: -45,
                y: -45,
                width: 90,
                height: 90,
            };
        case 3030: // 28x160
            return {
                mode: "rectangle",
                x: -14,
                y: -80,
                width: 28,
                height: 160,
            };
        case 3031: // 160x28
            return {
                mode: "rectangle",
                x: -80,
                y: -14,
                width: 160,
                height: 28,
            };
        case 3034: // 28x110
            return {
                mode: "rectangle",
                x: -14,
                y: -80,
                width: 28,
                height: 110,
            };
        case 3036: // 156x 20
            return {
                mode: "rectangle",
                x: -87.07,
                y: -25.5,
                width: 156,
                height: 20,
            };
        case 3040: // 125x125
            return {
                mode: "rectangle",
                x: -62.5,
                y: -62.5,
                width: 125,
                height: 125,
            };
        case 9000: // chess 6x6 lg
            return {
                mode: "chess",
                type: "rifle",
                size: 6,
            };
        case 9001: // chess 6x6 lp
            return {
                mode: "chess",
                type: "pistol",
                size: 6,
            };
        case 9003: // chess 5x5 lg
            return {
                mode: "chess",
                type: "rifle",
                size: 5,
            };
        case 9004: // chess 5x5 lp
            return {
                mode: "chess",
                type: "pistol",
                size: 5,
            };
        case 9005: // chess 7x7 lg
        case 9007:
            return {
                mode: "chess",
                type: "rifle",
                size: 7,
            };
        case 9006: // chess 7x7 lp
        case 9008:
            return {
                mode: "chess",
                type: "pistol",
                size: 7,
            };
        case 9010: // chess 10x10 lg
            return {
                mode: "chess",
                type: "rifle",
                size: 10,
            };
        case 9011: // chess 10x10 lp
            return {
                mode: "chess",
                type: "pistol",
                size: 10,
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