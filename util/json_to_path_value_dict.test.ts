import { json_to_path_value_dict } from "./json_to_path_value_dict.ts";
import { expect } from "@std/expect";

Deno.test(`Testing ${json_to_path_value_dict.name} function`, async (t) => {
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
                ]
            ) {
                await tt.step(
                    `In case when a and b are ${label}`, // deno-lint-ignore require-await
                    async () => {
                        const aResult = json_to_path_value_dict(a);

                        const bResult = json_to_path_value_dict(b);

                        console.log(aResult);
                        console.log(bResult);

                        expect(aResult.hash).toBe(bResult.hash);
                    },
                );
            }
        },
    );
});
