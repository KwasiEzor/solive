import { describe, expect, it } from "vitest";
import {
  andThen,
  err,
  fromPromise,
  fromThrowable,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  unwrapOr,
  type Result,
} from "@/lib/result";

describe("Result", () => {
  it("constructs ok", () => {
    const r = ok(42);
    expect(r).toEqual({ ok: true, value: 42 });
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
  });

  it("constructs err", () => {
    const r = err("boom");
    expect(r).toEqual({ ok: false, error: "boom" });
    expect(isErr(r)).toBe(true);
    expect(isOk(r)).toBe(false);
  });

  it("map transforms ok, passes err through", () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
    const e: Result<number, string> = err("x");
    expect(map(e, (n: number) => n * 3)).toEqual(err("x"));
  });

  it("andThen chains fallible ops", () => {
    const half = (n: number): Result<number, string> =>
      n % 2 === 0 ? ok(n / 2) : err("odd");
    expect(andThen(ok(8), half)).toEqual(ok(4));
    expect(andThen(ok(7), half)).toEqual(err("odd"));
    const prior: Result<number, string> = err("prior");
    expect(andThen(prior, half)).toEqual(err("prior"));
  });

  it("mapErr transforms error only", () => {
    expect(mapErr(err("x"), (s) => s.toUpperCase())).toEqual(err("X"));
    expect(mapErr(ok(1), (s: string) => s)).toEqual(ok(1));
  });

  it("unwrapOr falls back on err", () => {
    expect(unwrapOr(ok(1), 9)).toBe(1);
    expect(unwrapOr(err("x"), 9)).toBe(9);
  });

  it("fromThrowable captures throws", () => {
    expect(fromThrowable(() => 1)).toEqual(ok(1));
    const r = fromThrowable(() => {
      throw new Error("nope");
    });
    expect(isErr(r)).toBe(true);
  });

  it("fromPromise captures rejections", async () => {
    expect(await fromPromise(Promise.resolve(1))).toEqual(ok(1));
    const r = await fromPromise(Promise.reject(new Error("nope")));
    expect(isErr(r)).toBe(true);
  });
});
