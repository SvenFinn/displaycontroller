import { UnsignedInteger } from "../../common/index.js";

export type Zoom = ZoomFixed | ZoomBase;

type ZoomFixed = {
    mode: "fixed",
    value: UnsignedInteger,
}

type ZoomBase = {
    mode: "auto" | "none",
}