import type { JSONCompounded, JSONPrimitive } from "./types.ts";

/**
 * To minimize edge cases and simplify function logic -- this utility
 * should/may be called by client.
 */
export function is_unknown_json_but_not_js(
    candidate: unknown,
): candidate is (JSONCompounded | JSONPrimitive)[1] {
    let _candidate = candidate;

    try {
        _candidate = JSON.parse(JSON.stringify(candidate));
    } catch {
        console.warn("JSON parse error");
        return false;
    }

    const traverser = [_candidate] as unknown[];

    while (traverser.length) {
        const item = traverser.pop();

        if (
            typeof item === "bigint" ||
            typeof item === "function" ||
            typeof item === "symbol" ||
            typeof item === "undefined"
        ) {
            return false;
        } else if (typeof item !== "object") {
            continue;
        } else if (item === null) {
            continue;
        }

        for (
            const keyOrIndex of (Array.isArray(item)
                ? item.map((_, i) =>
                    i
                )
                : Object.keys(item))
        ) {
            const next = (item as Record<string, unknown>)[keyOrIndex];
            traverser.push(next);
        }
    }

    return true;
}
