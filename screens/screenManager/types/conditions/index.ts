import { ConditionMinMax, isConditionMinMax, ConditionNone, ConditionNumber, isConditionNone, isConditionNumber } from './base';

export type Condition = ConditionMinMax | ConditionNumber | ConditionNone;

export function isScreenCondition(condition: any): condition is Condition {
    if (!isConditionMinMax(condition) && !isConditionNumber(condition) && !isConditionNone(condition)) return false;
    return true;
}
