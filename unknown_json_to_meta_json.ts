import type {
    AnalyzedJsonMeta,
    JSONCompounded,
    JSONLeaf,
    JSONPrimitive,
    PathValueDict,
} from "./types.ts";

export function unknown_json_to_meta_json<
    T extends (JSONPrimitive | JSONCompounded)[1] =
        (JSONPrimitive | JSONCompounded)[1],
>(
    jsonValue: T,
    path_separator = " ",
    hash_separator_between_paths = " ",
): AnalyzedJsonMeta<any> {
    /// The type of the input value
    let type: (JSONCompounded | JSONPrimitive)[0] = "JSON.object";

    /// Detect actual value's type
    /// Though this huge check will be almost repeat in next loop
    /// here it has concrete purpose -- detect input's value
    /// type as it is
    if (typeof jsonValue === "object") {
        if (Array.isArray(jsonValue)) {
            type = "JSON.array";
        } else if (jsonValue === null) {
            type = "JSON.null";
        } else {
            type = "JSON.object";
        }
    } else if (typeof jsonValue === "number") {
        type = "JSON.number";
    } else if (typeof jsonValue === "string") {
        type = "JSON.string";
    } else if (typeof jsonValue === "boolean") {
        type = "JSON.boolean";
    } else {
        throw new Error(
            `ERROR: The <${jsonValue}> is not JSON serializable input!`,
        );
    }

    /// Early return for primitives
    if (type !== "JSON.object" && type !== "JSON.array") {
        return {
            type,
            shape_hash: type,
            origin: jsonValue as JSONPrimitive[1],
        };
    }

    /// To avoid recursion -- use this array that may grow during iteration
    /// Initialize it with actual value as first element
    const traverser = [
        [
            /// So this is initial value - and so any keys => keys-array is empty
            [],
            /// Our non-primitive value
            jsonValue,
        ],
    ] as [(string | number)[], unknown][];

    /// The accumulator for path=value dictionary
    const dict = {} as PathValueDict;

    while (
        /// So until traverser has items -- we can repeat our flatten strategy
        traverser.length
    ) {
        const [prev_keys, cursor] = traverser.pop() as [
            string[],
            JSONCompounded[1], /// UNSAFE: but we know that for other type is unreachable
        ];

        /// Only interesting in object or array (js-specific check)
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
            const is_primitive = typeof v !== "object" || v === null;
            const is_empty_compound = !is_primitive &&
                (Array.isArray(v) ? v : Object.keys(v)).length === 0;
            if (is_primitive || is_empty_compound) {
                /// The type of the input value
                let leaf_type: (JSONLeaf)[0] = "JSON.empty-object";

                /// Detect actual value's type
                /// Though this huge check will be almost repeat in next loop
                /// here it has concrete purpose -- detect input's value
                /// type as it is
                if (typeof jsonValue === "object") {
                    if (Array.isArray(jsonValue)) {
                        leaf_type = "JSON.empty-array";
                    } else if (jsonValue === null) {
                        leaf_type = "JSON.null";
                    } else {
                        leaf_type = "JSON.empty-object";
                    }
                } else if (typeof jsonValue === "number") {
                    leaf_type = "JSON.number";
                } else if (typeof jsonValue === "string") {
                    leaf_type = "JSON.string";
                } else if (typeof jsonValue === "boolean") {
                    leaf_type = "JSON.boolean";
                } else {
                    throw new Error(
                        `ERROR: The <${jsonValue}> is not JSON serializable input!`,
                    );
                }
                dict[
                    keys.map((k) => JSON.stringify(k)).join(
                        path_separator,
                    )
                ] = {
                    type: leaf_type,
                    leaf: v as JSONLeaf[1],
                    keys_as_array: keys,
                };
            } else {
                /// So in traverser appears new element for each key
                /// With 1 only key!
                /// So this is flattening moment
                traverser.push([keys, v]);
            }
        }
    }

    return {
        type,
        origin: jsonValue,
        dict: dict as any,
        shape_hash: Object.keys(dict).sort().join(hash_separator_between_paths),
    };
}
