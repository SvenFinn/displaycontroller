import { ConditionMinMax, ConditionNone, ConditionNumber } from './base';

export type Condition = ConditionMinMax | ConditionNumber | ConditionNone;