import { Rule } from "./rule";

export interface Level {
    initialWord: string;
    targetWord: string;
    rules: Rule[];
}
