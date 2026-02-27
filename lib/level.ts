import { Rule } from "./rule";

export const NUM_LEVELS = 10;

export interface Level {
    name: string;
    // initialWord: string;
    // targetWord: string;
    words: {
        initialWord: string;
        targetWord: string;
    }[];
    rules: Rule[];
}
