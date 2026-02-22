import { Rule } from "./rule";

export const NUM_LEVELS = 8;

export interface Level {
    name: string;
    initialWord: string;
    targetWord: string;
    rules: Rule[];
}
