import AhoCorasick from "ahocorasick";
import { Matcher } from "../types";

export function createMatcher<T>(candidates: ReadonlyMap<string, T[]>): Matcher<T> {
    const needles = Array.from(candidates.keys());
    const matcher = new AhoCorasick(needles);
    return {
        matcher,
        candidates
    };
}