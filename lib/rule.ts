export interface Rule {
    pattern: string;
    replacement: string;
    // environment?: string | null;
}

export function applyRule(rule: Rule, word: string): string {
    return word.replaceAll(rule.pattern, rule.replacement);
}

export function applyRules(rules: Rule[], word: string): string {
    rules.forEach((rule) => (word = applyRule(rule, word)));

    return word;
}

export function formatRule(rule: Rule): string {
    return `${rule.pattern} → ${rule.replacement}`;
}
