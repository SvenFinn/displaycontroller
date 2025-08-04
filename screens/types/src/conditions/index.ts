import { ConditionMinMax, ConditionNone, ConditionNumber } from './base';

type Condition = ConditionMinMax | ConditionNumber | ConditionNone;

export type Conditions = {
    mode: 'and' | 'or';
    conditions: Condition[];
}