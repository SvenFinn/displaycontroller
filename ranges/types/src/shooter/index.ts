import { Index } from "../common/index.js";

export type ShooterId = Index;

type ShooterName = {
    firstName: string;
    lastName: string;
}

export type Shooter = {
    id: ShooterId | null; // Null = Can't be determined uniquely
} & ShooterName;

export type ShooterFree = {
    type: "free";
}

export type ShooterOccupied = {
    type: "occupied";
} & Shooter;

export type RangeShooter = ShooterFree | ShooterOccupied;

export type InternalShooter = InternalShooterFree | InternalShooterById | InternalShooterByName;

export type InternalShooterFree = {
    type: "free";
}

export type InternalShooterById = {
    type: "byId";
    id: ShooterId;
}

export type InternalShooterByName = {
    type: "byName";
} & ShooterName;
