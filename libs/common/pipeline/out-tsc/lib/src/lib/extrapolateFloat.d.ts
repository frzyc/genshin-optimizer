type Options = {
    mantissaLen?: number;
    forced?: boolean;
};
/**
 * Extrapolate the single-precision number `val` to a double-precision number
 * by assuming that the *actual* value has the fewest number of digits amongst
 * numbers that are rounded to `val`. In case of ambiguity (multiple values
 * with the same number of digits round to `val`), return the original value.
 *
 * Implementation Note:
 * This is a stand-in for float conversion as `console.log` always print numbers
 * as double-precision. In a language with single-precision numbers, this can be
 * replaced with an equivalent of `doubleFromString(floatToString(val))`.
 *
 * Reference: This is inspired by
 * Section 3.1 in Printing Floating-Point Numbers: An Always Correct Method
 * (https://cseweb.ucsd.edu/~lerner/papers/fp-printing-popl16.pdf)
 * */
export declare function extrapolateFloat(val: number, options?: Options): number;
/** Round `val` to the nearest value with `n`-bit mantissa */
export declare function roundMantissa(val: number, n: number): number;
export {};
//# sourceMappingURL=extrapolateFloat.d.ts.map