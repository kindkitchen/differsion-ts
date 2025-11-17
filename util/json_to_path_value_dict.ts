export function json_to_path_value_dict<T>(
    jsonValue: T,
    path_separator = "/",
    hash_separator_between_paths = "",
) {
    try {
        /// Check that this is valid json, avoid undefined and another js-only though safe things
        const _jsonValue = JSON.parse(JSON.stringify(jsonValue));

        /// The type of the input value
        let type = "Json::OBJECT" as
            | "Json::null"
            | "Json::string"
            | "Json::number"
            | "Json::boolean"
            | "Json::ARRAY"
            | "Json::OBJECT";

        /// Detect actual value's type
        /// Though this huge check will be almost repeat in next loop
        /// here it has concrete purpose -- detect input's value
        /// type as it is
        if (typeof _jsonValue === "object") {
            if (Array.isArray(_jsonValue)) {
                type = "Json::ARRAY";
            } else if (_jsonValue === null) {
                type = "Json::null";
            } else {
                type = "Json::OBJECT";
            }
        } else if (typeof _jsonValue === "number") {
            type = "Json::number";
        } else if (typeof _jsonValue === "string") {
            type = "Json::string";
        } else if (typeof _jsonValue === "boolean") {
            type = "Json::boolean";
        } else {
            throw new Error(`ERROR: not JSON serializable input!`);
        }

        /// Early return for primitives
        if (type !== "Json::OBJECT" && type !== "Json::ARRAY") {
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
            if (typeof cursor === "object" && cursor !== null) {
                /// Iterate over array/object in agnostic way
                /// So keys still be keys, indexes become keys
                for (
                    const key of Array.isArray(cursor)
                        ? Array.from({ length: cursor.length }).map((_, i) => i)
                        : Object.keys(cursor)
                ) {
                    /// Possibly the leaf in the json-structure (primitive value)
                    const v = cursor[key];
                    const keys = [...prev_keys, key];

                    if (typeof v !== "object" || v === null) {
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
