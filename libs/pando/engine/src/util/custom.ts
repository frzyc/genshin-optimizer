/**
 * Whether the function is increasing/decreasing w.r.t. to an argument.
 * Setting both to `true` means that the function is increasing in some
 * regions, and decreasing in another. Setting both to `false` means
 * altering the argument does not change the value of the function.
 */
export type Tonicity = { inc: boolean; dec: boolean }
export type Range = { min: number; max: number }

export type CustomInfo = {
  /** Given a range of each arguments, returns the range of the result */
  range: (r: Range[]) => Range
  /** Given the range of the arguments, returns whether the function is increasing/decreasing w.r.t. to each argument */
  tonicity: (r: Range[]) => Tonicity[]
  /** Actual computation of the custom node */
  calc: (_: (number | string)[]) => number | string
}

// This needs to be set only once at the beginning of the program.
export const customOps: Record<string, CustomInfo> = {}
