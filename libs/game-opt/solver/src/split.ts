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
  const incomp: string[] = []
  const inc: string[] = []
  const dec: string[] = []
  for (const [k, m] of monotonicities)
    if (m.inc) inc.push(k)
    else if (m.dec) dec.push(k)
    else incomp.push(k)

  if (incomp.length) {
    for (let i = 0, len = cndRanges.length; i < len; i++) {
      const ranges = cndRanges[i]
      const s = incomp.find((s) => ranges[s].min !== ranges[s].max)
      if (s === undefined) continue

      const groups = new Map<any, Candidate<ID>[]>()
      for (const c of candidates[i]) {
        const old = groups.get(c[s])
        if (old) old.push(c)
        else groups.set(c[s], [c])
      }
      // Split by the first axis by values of incomp `s`
      return [...groups.values()]
        .sort((a, b) => b.length - a.length) // smaller groups at the back
        .map((cnds) => {
          const result = [...candidates]
          result[i] = cnds
          return result
        })
    }
  }

  // TODO: this weight favors values with large magnitudes
  const weights = new Map([
    ...inc.map((i) => [i, Math.random()] as const),
    ...dec.map((i) => [i, -Math.random()] as const),
  ])
  const slot = candidates.reduce(
    (best, cnds, i, arr) => (arr[best].length < cnds.length ? i : best),
    0
  )
  const vals = candidates[slot].map((c) => {
    const val = Object.entries(c).reduce(
      (s, [k, v]) => (typeof v === 'number' ? s + v * weights.get(k)! : s),
      0
    )
    return [c, val] as const
  })
  vals.sort((a, b) => a[1] - b[1]) // larger vals at the back
  // Split the slot (roughly) into four equal slots
  const chunkLen = Math.ceil(vals.length / 4)
  const chunks: Candidate<ID>[][][] = []
  for (let i = 0; i < vals.length; i += chunkLen) {
    const chunk = vals.slice(i, i + chunkLen).map(([c]) => c)
    const result = [...candidates]
    result[slot] = chunk
    chunks.push(result)
  }
  return chunks
}
