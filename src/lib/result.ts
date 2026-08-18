/**
 * Result<T, E> — explicit success/failure without throwing.
 * Server Actions and services return this instead of raising, so callers
 * must handle the error branch (SLV-140, DoD §4).
 */

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok;
}

export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return !r.ok;
}

/** Map the success value, leaving an error untouched. */
export function map<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}

/** Chain a fallible operation onto a success. */
export function andThen<T, U, E>(
  r: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return r.ok ? fn(r.value) : r;
}

/** Map the error value, leaving a success untouched. */
export function mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return r.ok ? r : err(fn(r.error));
}

/** Extract the value or fall back. */
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}

/** Wrap a throwing function into a Result. */
export function fromThrowable<T>(fn: () => T): Result<T, unknown> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error);
  }
}

/** Wrap an async throwing function into a Result. */
export async function fromPromise<T>(promise: Promise<T>): Promise<Result<T, unknown>> {
  try {
    return ok(await promise);
  } catch (error) {
    return err(error);
  }
}
