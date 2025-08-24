export type RangeProxyType = {
    mac: string,
    ip: string,
    message: string
}

export function isRangeProxy(obj: any): obj is RangeProxyType {
    if (!obj || typeof obj !== "object") return false;
    if (typeof obj.mac !== "string") return false;
    if (typeof obj.ip !== "string") return false;
    if (typeof obj.message !== "string") return false;
    return true;
}