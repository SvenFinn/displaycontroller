
export function getLocalMs(): number {
    const now = new Date();
    return now.getTime() - (now.getTimezoneOffset() * 60000);
}

