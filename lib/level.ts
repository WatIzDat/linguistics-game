import { Rule } from "./rule";

export interface Level {
    name: string;
    initialWord: string;
    targetWord: string;
    rules: Rule[];
}
