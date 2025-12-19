import { createIs } from "typia";
import { Index, UnsignedInteger } from "../common/index.js";

export type ShooterId = Index;

export type Shooter = {
    id: ShooterId | null; // Null = Can't be determined uniquely
    firstName: string;
    lastName: string;
}

export type InternalShooter = ShooterId | InternalShooterByName;

export type InternalShooterByName = {
    firstName: string,
    lastName: string,
}
