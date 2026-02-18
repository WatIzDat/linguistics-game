export interface Rule {
    pattern: string;
    replacement: string;
    environment?: string | null;
}

export function applyRule(rule: Rule, word: string): string {
    if (!rule.environment) {
        return word.replaceAll(rule.pattern, rule.replacement);
    }

    const environment: (string | null)[] = rule.environment.split(" ");

    if (environment.length < 3) {
        if (environment[1] === "_") {
            environment.push(null);
        } else {
            environment.unshift(null);
        }
    }

    let left: string = "";
    let right: string = "";

    // if (environment.length === 3) {
    //     // re = new RegExp(
    //     //     `(?<=${environment[0]})${rule.pattern}(?=${environment[2]})`,
    //     //     "g",
    //     // );

    //     if (environment[0][0] === "#") {
    //         if (environment[0].length > 1) {
    //             left = `^(?<=${environment[0].substring(1)})`;
    //         } else {
    //             left = `^`;
    //         }
    //     } else {
    //         left = `(?<=${environment[0]})`;
    //     }

    //     if (environment[2][0] === "#") {
    //         if (environment[2].length > 1) {
    //             right = `(?=${environment[2].substring(1)})$`;
    //         } else {
    //             right = `$`;
    //         }
    //     } else {
    //         right = `(?=${environment[2]})`;
    //     }
    // } else {
    //     if (environment[1] === "_") {
    //         re = new RegExp(`(?<=${environment[0]})${rule.pattern}`, "g");
    //     } else {
    //         re = new RegExp(`${rule.pattern}(?=${environment[1]})`, "g");
    //     }
    // }

    if (environment[0]) {
        if (environment[0][0] === "#") {
            if (environment[0].length > 1) {
                left = `(?<=^${environment[0].substring(1)})`;
            } else {
                left = `^`;
            }
        } else {
            left = `(?<=${environment[0]})`;
        }
    }

    if (environment[2]) {
        if (environment[2][environment[2].length - 1] === "#") {
            if (environment[2].length > 1) {
                right = `(?=${environment[2].substring(0, environment[2].length - 1)}$)`;
            } else {
                right = `$`;
            }
        } else {
            right = `(?=${environment[2]})`;
        }
    }

    const re: RegExp = new RegExp(`${left}${rule.pattern}${right}`, "g");

    console.log(re);

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
