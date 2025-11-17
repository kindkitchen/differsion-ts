import type { JSONCompounded, JSONPrimitive } from "./types.ts";

const util = {
    is_empty_arr,
    is_empty_obj,
    is_json_arr_or_obj,
    is_json_obj,
};

export const MetaJSON = {
    util,
    is_unknown_json_but_not_js,
    from_unknown_json: unknown_json_to_meta_json,
};
function unknown_json_to_meta_json<
    T extends (JSONPrimitive | JSONCompounded)[1] =
        (JSONPrimitive | JSONCompounded)[1],
>(
    jsonValue: T,
    path_separator = "/",
    hash_separator_between_paths = "",
) {
    try {
        /// Check that this is valid json, avoid undefined and another js-only though safe things
        const _jsonValue = JSON.parse(JSON.stringify(jsonValue));

        /// The type of the input value
        let type: (JSONCompounded | JSONPrimitive)[0] = "JSON.object";

        /// Detect actual value's type
        /// Though this huge check will be almost repeat in next loop
        /// here it has concrete purpose -- detect input's value
        /// type as it is
        if (typeof _jsonValue === "object") {
            if (Array.isArray(_jsonValue)) {
                type = "JSON.array";
            } else if (_jsonValue === null) {
                type = "JSON.null";
            } else {
                type = "JSON.object";
            }
        } else if (typeof _jsonValue === "number") {
            type = "JSON.number";
        } else if (typeof _jsonValue === "string") {
            type = "JSON.string";
        } else if (typeof _jsonValue === "boolean") {
            type = "JSON.boolean";
        } else {
            throw new Error(`ERROR: not JSON serializable input!`);
        }

        /// Early return for primitives
        if (type !== "JSON.object" && type !== "JSON.array") {
            return {
                type,
                value: _jsonValue,
                dict: {},
                hash: type,
            };
        }

        /// To avoid recursion -- use this array that may grow during iteration
        /// Initialize it with actual value as first element
        const traverser = [
            [
                /// So this is initial value - and so any keys => keys-array is empty
                [],
                /// Our non-primitive value
                _jsonValue,
            ],
        ] as [(string | number)[], any][];

        /// The accumulator for path=value dictionary
        const dict = {} as any;

        do {
            const [prev_keys, cursor] = traverser.pop()!;

            /// Only interesting in object or array (js-specific check)
            if (util.is_json_arr_or_obj(cursor)) {
                /// Iterate over array/object in agnostic way
                /// So keys still be keys, indexes become keys
                for (
                    const key of Array.isArray(cursor)
                        ? Array.from({ length: cursor.length }).map((_, i) => i)
                        : Object.keys(cursor)
                ) {
                    /// Possibly the leaf in the json-structure (primitive value)
                    const v = (cursor as Record<string, unknown>)[key];
                    const keys = [...prev_keys, key];

                    if (!util.is_json_arr_or_obj(cursor)) {
                        dict[
                            keys.map((k) => JSON.stringify(k)).join(
                                path_separator,
                            )
                        ] = v;
                    } else {
                        /// So in traverser appears new element for each key
                        /// With 1 only key!
                        /// So this is flattening moment
                        traverser.push([keys, v]);
                    }
                }

                continue;
            }
        } while (
            /// So until traverser has items -- we can repeat our flatten strategy
            traverser.length
        );

        return {
            type,
            value: _jsonValue,
            dict,
            hash: Object.keys(dict).sort().join(hash_separator_between_paths),
        };
    } catch {
        throw new Error(`ERROR: not JSON serializable input!`);
    }
}

function is_json_obj(
    candidate: unknown,
): candidate is Record<string, unknown> {
    return typeof candidate === "object" && candidate !== null &&
        !Array.isArray(candidate);
}

function is_json_arr_or_obj(
    candidate: unknown,
): candidate is Record<string, unknown> | unknown[] {
    return typeof candidate === "object" && candidate !== null;
}

function is_empty_obj(candidate: unknown): candidate is Record<string, never> {
    return typeof candidate === "object" && candidate !== null &&
        !Array.isArray(candidate) && Object.keys(candidate).length === 0;
}

function is_empty_arr(candidate: unknown): candidate is [] {
    return Array.isArray(candidate) && candidate.length === 0;
}

/**
 * To minimize edge cases and simplify function logic -- this utility
 * should/may be called by client.
 */
function is_unknown_json_but_not_js(
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
