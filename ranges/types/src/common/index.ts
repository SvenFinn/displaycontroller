import { tags } from "typia";

export type Integer = number & tags.MultipleOf<1>;
export type UnsignedNumber = number & tags.Minimum<0>;
export type UnsignedInteger = Integer & UnsignedNumber;

export type RangeId = Integer & tags.Minimum<1> & tags.Maximum<416>;
export type Index = UnsignedInteger;

export type ColorCode = string & tags.MinLength<7> & tags.MaxLength<7>;