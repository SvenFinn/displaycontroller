import { tags } from "typia";

export type Integer = number & tags.MultipleOf<1>;
export type PositiveInteger = number & tags.Minimum<1> & tags.MultipleOf<1>;

export type DateString = string & tags.Format<"date">;
export type ScreenId = PositiveInteger;
export type RangeId = PositiveInteger & tags.Maximum<416>;
