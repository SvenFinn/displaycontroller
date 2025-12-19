import { Maximum } from "typia/lib/tags/Maximum.js";
import { Minimum } from "typia/lib/tags/Minimum.js";
import { MultipleOf } from "typia/lib/tags/MultipleOf.js";
import { MinLength } from "typia/lib/tags/MinLength.js";
import { MaxLength } from "typia/lib/tags/MaxLength.js";

export type Integer = number & MultipleOf<1>;
export type UnsignedNumber = number & Minimum<0>;
export type UnsignedInteger = Integer & UnsignedNumber;

export type RangeId = Integer & Minimum<1> & Maximum<416>;
export type Index = UnsignedInteger;

export type ColorCode = string & MinLength<7> & MaxLength<7>;