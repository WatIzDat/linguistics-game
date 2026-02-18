export interface Rule {
    pattern: string;
    replacement: string;
    environment?: string | null;
}

export function applyRule(rule: Rule, word: string): string {
    if (!rule.environment) {
        return word.replaceAll(rule.pattern, rule.replacement);
    }

    const environment = rule.environment.split(" ");

    let re: RegExp;

    if (environment.length === 3) {
        re = new RegExp(
            `(?<=${environment[0]})${rule.pattern}(?=${environment[2]})`,
            "g",
        );
    } else {
        if (environment[1] === "_") {
            re = new RegExp(`(?<=${environment[0]})${rule.pattern}`, "g");
        } else {
            re = new RegExp(`${rule.pattern}(?=${environment[1]})`, "g");
        }
    }

    return word.replace(re, rule.replacement);
}

export function applyRules(rules: Rule[], word: string): string {
    rules.forEach((rule) => (word = applyRule(rule, word)));

    return word;
}

export function formatRule(rule: Rule): string {
    return rule.environment
        ? `${rule.pattern} → ${rule.replacement} / ${rule.environment}`
        : `${rule.pattern} → ${rule.replacement}`;
}
