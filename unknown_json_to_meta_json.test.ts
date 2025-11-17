import { is_unknown_json_but_not_js } from "./is_unknown_json_but_not_js.ts";
import { unknown_json_to_meta_json } from "./unknown_json_to_meta_json.ts";
import { expect } from "@std/expect";

Deno.test(`Testing ${unknown_json_to_meta_json.name} function`, async (t) => {
    await t.step(
        "All these data pairs should produce same keys in dictionaries",
        async (tt) => {
            for (
                const [a, b, label] of [
                    [null, null, "nulls"],
                    [true, false, "booleans"],
                    [1, -22, "+/- numbers"],
                    [0.4, 404, , "float/int number"],
                    [[], [], "empty arrays"],
                    [{}, {}, "empty objects"],
                    ["", "str", "empty and with length strings"],
                    ["str2", "str 3", "2 strings"],
                    [
                        { hello: "world", ok: "google" },
                        { ok: "shmoogle", hello: "lord" },
                        "object with same keys",
                    ],
                    [
                        {
                            hello: {
                                w: {
                                    o: {
                                        r: "r",
                                        l: "l",
                                        d: "hello world",
                                    },
                                },
                            },
                        },
                        {
                            hello: {
                                w: {
                                    o: {
                                        r: "r2",
                                        l: "l2",
                                        d: "hello world2",
                                    },
                                },
                            },
                        },
                        "object with some keys (more deeper)",
                    ],
                    [
                        [
                            {
                                hello: {
                                    w: {
                                        o: {
                                            r: "r",
                                            l: "l",
                                            d: "hello world",
                                        },
                                    },
                                },
                            },
                            {
                                hello: {
                                    w: {
                                        o: {
                                            r: "r2",
                                            l: "l2",
                                            d: "hello world2",
                                        },
                                    },
                                },
                            },
                            "object with some keys (more deeper)",
                        ],
                        [
                            {
                                hello: {
                                    w: {
                                        o: {
                                            r: "r",
                                            l: "l",
                                            d: "hello world",
                                        },
                                    },
                                },
                            },
                            {
                                hello: {
                                    w: {
                                        o: {
                                            r: "r2",
                                            l: "l2",
                                            d: "hello world2",
                                        },
                                    },
                                },
                            },
                            "object with some keys (more deeper)",
                        ],
                        "deep arrays",
                    ],
                ]
            ) {
                await tt.step(
                    `In case when a and b are ${label}`, // deno-lint-ignore require-await
                    async () => {
                        if (
                            is_unknown_json_but_not_js(a) &&
                            is_unknown_json_but_not_js(b)
                        ) {
                            const aResult = unknown_json_to_meta_json(
                                a,
                            );
                            const bResult = unknown_json_to_meta_json(
                                b,
                            );

                            expect(aResult.hash).toBe(bResult.hash);
                        } else {
                            expect("Should not").toBe(
                                "here, because values are not valid json unknowns",
                            );
                        }
                    },
                );
            }
        },
    );
});
