import { assertEquals } from "$std/assert/assert_equals.ts";
import { json5Parse, json5Stringify } from "./stringSerialization.ts";

Deno.test("String serialization/deserialization", () => {
  //string 
  assertSerialization("");
  assertSerialization("abc");
});

Deno.test("Number serialization/deserialization", () => {
  //number
  assertSerialization(-1);
  assertSerialization(0);
  assertSerialization(1);
});

Deno.test("BigInt serialization/deserialization", () => {
  //bigint
  assertSerialization(BigInt(-1n));
  assertSerialization(BigInt(0));
  assertSerialization(BigInt(1n));
  assertSerialization(BigInt(12345678901232434561234234n));
});

Deno.test("Boolean serialization/deserialization", () => {
  //boolean
  assertSerialization(true);
  assertSerialization(false);
});

Deno.test("null serialization/deserialization", () => {
  //null
  assertSerialization(null);
});

Deno.test("Array serialization/deserialization", () => {
  //array
  assertSerialization([]);
  assertSerialization([1, 2, 3]);
  assertSerialization([[["a", "b"], "c"], "d"]);
});

Deno.test("Map serialization/deserialization", () => {
  //map
  assertSerialization(new Map());
  assertSerialization(new Map([["a", "b"]]));
  assertSerialization(new Map([["a", "b"], ["c", "d"]]));

  const innerMap = new Map([["a2", "b2"]]);
  const innerMap2 = new Map([["a3", "b3"]]);
  assertSerialization(new Map<string, Map<string, string>>([["a", innerMap], ["d", innerMap2]]));
});

Deno.test("Set serialization/deserialization", () => {
  //set
  assertSerialization(new Set());
  assertSerialization(new Set(["a", "b"]));
  assertSerialization(new Set([new Set(["a", "b"]), new Set(["c", "d"])]));
});

Deno.test("RegExp serialization/deserialization", () => {
  //regexp
  assertSerialization(new RegExp("a"));
  assertSerialization(new RegExp(/[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}/));
  assertSerialization(/^\[((?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:,(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d))*)?]?$/);
  assertSerialization(new RegExp(/a/gi));
});

Deno.test("Symbol serialization/deserialization", () => {
  //symbol
  assertSerialization(Symbol("a"));
});

Deno.test("Deno.KvU64 serialization/deserialization", () => {
  //kvu64
  assertSerialization(new Deno.KvU64(0n));
  assertSerialization(new Deno.KvU64(1234n));
});

Deno.test("Uint8Array serialization/deserialization", () => {
  //uint8array
  assertSerialization(new Uint8Array());
  assertSerialization(new Uint8Array([1, 2, 3]));
});

Deno.test("Date serialization/deserialization", () => {
  //date
  assertSerialization(new Date());
  assertSerialization(new Date(0));
  assertSerialization(new Date(1234567890123));
});

Deno.test("Simple object serialization/deserialization", () => {
  //object
  assertSerialization({});
  assertSerialization({ a: "a" });
  assertSerialization({ a: "a", b: 1, c: true });
});

Deno.test("Complex object serialization/deserialization", () => {
  //Map with Date
  assertSerialization(new Map([["c", new Date()]]));

  //complex object
  assertSerialization({
    a: "a",
    b: 1,
    c: true,
    d: new Map([["a", "b"]]),
    e: new Set(["a", "b"]),
    f: BigInt(1),
    h: new RegExp("a"),
    i: new Uint8Array([1, 2, 3]),
    k: new Deno.KvU64(1234n),
  });

  assertSerialization({
    a: "a",
    b: 1,
    c: true,
    d: new Map<string, string|Date>([["a", "b"], ["c", new Date()]]),
    e: new Set(["a", "b"]),
    f: BigInt(1),
    h: new RegExp("a"),
    i: new Uint8Array([1, 2, 3]),
    k: new Deno.KvU64(1234n),
    l: {
      a: "a",
      b: 1,
      c: true,
      d: new Map([["a", "b"]]),
      e: new Set(["a", "b"]),
      f: BigInt(1),
      h: new RegExp("a"),
      i: new Uint8Array([1, 2, 3]),
      k: new Deno.KvU64(1234n),
    }
  });
});

Deno.test("undefined does not fully work, but ensure it does not crash", () => {
  const obj = { a: 1, b: undefined, c: 3 };
  const str = json5Stringify(obj);

  // this unfortunately removes property 'b' from the serialized string
  const obj2 = json5Parse(str);
  assertEquals({ a: 1, c: 3 }, obj2);
  assertEquals('{\n  type: "undefined",\n  value: "undefined",\n}', json5Stringify(undefined));
  assertEquals(undefined, json5Parse(json5Stringify(undefined)));
});

Deno.test("Multiline Uint8Arrays are flattened", () => {
  const expected = `{
  iv: {
    type: "Uint8Array",
    value: [31,90,22,243,4,102,182,95,8,206,15,63,],
  },\n}`;
  const actual = json5Stringify({ iv: new Uint8Array([31, 90, 22, 243, 4, 102, 182, 95, 8, 206, 15, 63]) });
  assertEquals(actual, expected);
})

function assertSerialization(obj: unknown) {
  const str = json5Stringify(obj);
  const obj2 = json5Parse(str);

  if (typeof obj === "symbol") {
    assertEquals(obj.toString(), (obj2 as symbol).toString());
  } else {
    assertEquals(obj2, obj);
  }
}