export type Shooter = {
    id: number | null; // Null = Can't be determined uniquely
    firstName: string;
    lastName: string;
}

export function isShooter(shooter: any): shooter is Shooter {
    if (typeof shooter !== "object") return false;
    if (typeof shooter.id !== "number" && shooter.id !== null) return false;
    if (typeof shooter.firstName !== "string") return false;
    if (typeof shooter.lastName !== "string") return false;
    return true;
}