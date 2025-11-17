/**
 * Typescript pair for JSON primitives:
 * Label on first position
 * And appropriated type on second
 * ---
 * > `string`, `number`, `boolean`, `null`
 */
export type JSONPrimitive =
    | ["JSON.number", number]
    | ["JSON.string", string]
    | [
        "JSON.boolean",
        boolean,
    ]
    | ["JSON.null", null];

/**
 * JSON values, that are finish of the structure tree -- leafs.
 * ---
 * > so these are primitives + empty array or object
 */
export type JSONLeaf =
    | JSONPrimitive
    | ["JSON.empty-object", Record<string, never>]
    | ["JSON.empty-array", []];

/**
 * Typescript pair for compounded JSON data types:
 * Label on first position
 * And appropriated type on second
 * ---
 * > `Array` or `Object`
 */
export type JSONCompounded = ["JSON.object", Array<unknown>] | [
    "JSON.array",
    Record<string, unknown>,
];

/**
 * Representation of some compounded JSON value,
 * where all deep nesting is squashed to one key value pair.
 * The key is represent whole path to value.
 * Though the value itself is some extra fields with original leaf value among them.
 * ---
 * So properties:
 * - `leaf` -- the last primitive value
 * - `type` -- represent JSON type of **leaf**
 * - `keys_as_array` -- array of the keys as they are, without possible delimiters between
 */
export type PathValueDict<T extends JSONLeaf = JSONLeaf> = Record<
    string,
    {
        type: T[0];
        leaf: T[1];
        keys_as_array: (string | number)[];
    }
>;

/**
 * Final representation of some JSON value.
 */
export type AnalyzedJsonMeta<
    T extends (JSONCompounded | JSONPrimitive)[1],
> =
    & {
        origin: T;
        type: (JSONCompounded | JSONPrimitive)[0];
        shape_hash: string;
    }
    & (T extends JSONLeaf[1] ? { dict?: never }
        : { dict: PathValueDict<JSONLeaf> });
