import type {
  Candidate,
  Monotonicity,
  Range,
} from '@genshin-optimizer/pando/engine'

export function splitCandidates<ID>(
  candidates: Candidate<ID>[][],
  cndRanges: Record<string, Range>[],
  monotonicities: Map<string, Monotonicity>
): Candidate<ID>[][][] {
  const withSlot = (slot: number, cnds: Candidate<ID>[]) => {
    const result = [...candidates]
    result[slot] = cnds
    return result
  }

  const incomp: string[] = []
  const inc: string[] = []
  const dec: string[] = []
  for (const [k, m] of monotonicities)
    if (m.inc) inc.push(k)
    else if (m.dec) dec.push(k)
    else incomp.push(k)

  if (incomp.length) {
    for (let slot = 0, len = cndRanges.length; slot < len; slot++) {
      const ranges = cndRanges[slot]
      const s = incomp.find((s) => ranges[s].min !== ranges[s].max)
      if (s === undefined) continue

      const groups = new Map<any, Candidate<ID>[]>()
      for (const c of candidates[slot]) {
        const old = groups.get(c[s])
        if (old) old.push(c)
        else groups.set(c[s], [c])
      }
      // Split by the first axis by (incomp) `s`
      return [...groups.values()]
        .sort((a, b) => b.length - a.length) // smaller groups at the back
        .map((cnds) => withSlot(slot, cnds))
    }
  }

  // TODO: this weight favors values with large magnitudes
  const weights = new Map([
    ...inc.map((i) => [i, Math.random()] as const),
    ...dec.map((i) => [i, -Math.random()] as const),
  ])
  const slot = candidates.reduce(
    (i, { length: lj }, j, arr) => (arr[i].length > lj ? i : j),
    0
  )
  const vals = candidates[slot].map((c) => {
    const val = Object.entries(c).reduce(
      (s, [k, v]) => (weights.has(k) ? s + (v as number) * weights.get(k)! : s),
      0
    )
    return [c, val] as const
  })
  vals.sort((a, b) => a[1] - b[1]) // larger vals at the back
  // Split into four (roughly) equal slots
  const chunkLen = Math.ceil(vals.length / 4)
  const chunks: Candidate<ID>[][][] = []
  for (let i = 0, len = vals.length; i < len; i += chunkLen) {
    const cnds = vals.slice(i, i + chunkLen).map(([c]) => c)
    chunks.push(withSlot(slot, cnds))
  }
  return chunks
}
