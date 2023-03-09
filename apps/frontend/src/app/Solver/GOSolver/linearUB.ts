import { OptNode } from "../../Formula/optimization";
import { assertUnreachable, cartesian } from "../../Util/Util";
import { ArtifactsBySlot, DynStat, MinMax, computeFullArtRange } from "../common";
import { polyUB } from "./polyUB";
import { solveLP } from "./solveLP";

export type Linear = DynStat & { $c: number }

function weightedSum(...entries: readonly (readonly [number, Linear])[]): Linear {
  const result = { $c: 0 }
  for (const [weight, entry] of entries)
    for (const [k, v] of Object.entries(entry))
      result[k] = (result[k] ?? 0) + weight * v
  return result
}

export function linearUB(nodes: OptNode[], arts: ArtifactsBySlot): Linear[] {
  const polys = polyUB(nodes, arts)
  const minMax = computeFullArtRange(arts)

  return polys.map(poly =>
    weightedSum(...poly.map(mon => {
      const bounds = mon.terms.map(key => minMax[key])
      const { w, $c } = linbound(bounds, mon.$k >= 0 ? 'upper' : 'lower')
      const linboi: Linear = { $c }
      mon.terms.forEach((key, i) => linboi[key] = w[i] + (linboi[key] ?? 0))
      return [mon.$k, linboi] as readonly [number, Linear]
    }))
  )
}

/**
 * Constructs a linear upper bound for a monomial on a bounded domain using an LP.
 *
 * Monomial is assumed to be
 *    m(x) = x1 * x2 * ... * xn
 * on bounded domain
 *    min_1 <= x1 <= max_1
 *    min_2 <= x2 <= max_2
 *    ...
 *    min_n <= xn <= max_n
 *
 * @param bounds List of min/max bounds for each xi
 * @returns A linear function L(x) = w . x + $c
 *            satisfying      m(x) <= L(x) <= m(x) + err
 */
function linbound(bounds: MinMax[], direction: ("upper" | "lower") = "upper"): { w: number[], $c: number, err: number } {
  if (bounds.length === 0) return { w: [], $c: 1, err: 0 } // vacuous product is 0
  const nVar = bounds.length

  // Re-scale bounds to [0, 1] for numerical stability.
  const boundScale = bounds.map(({ max }) => max)
  const scaleProd = boundScale.reduce((prod, v) => prod * v, 1)
  bounds = bounds.map(({ min, max }) => ({ min: min / max, max: 1 }))

  // Setting up the linear program in terms of constraints.
  //   cartesian(bounds) loops 2^nVar times
  const cons = cartesian(...bounds.map(({ min, max }) => [min, max]))
    .flatMap(coords => {
      const prod = coords.reduce((prod, v) => prod * v, 1)
      let lpRow: number[][];
      if (direction === 'upper')
        lpRow = [
          [...coords.map(v => -v), 1, 0, -prod],
          [...coords, -1, -1, prod],
        ]
      else if (direction === 'lower')
        lpRow = [
          [...coords, -1, 0, prod],
          [...coords.map(v => -v), 1, -1, -prod],
        ]
      else assertUnreachable(direction)
      return lpRow
    })

  const objective = [...bounds.map(_ => 0), 0, 1]
  try {
    const soln = solveLP(objective, cons)
    return {
      w: soln.slice(0, nVar).map((wi, i) => wi * scaleProd / boundScale[i]),
      $c: -scaleProd * soln[nVar],
      err: scaleProd * soln[nVar + 1]
    }
  }
  catch (e) {
    console.log('ERROR on bounds', bounds)
    console.log('Possibly numerical instability issue.')
    console.log(e)
    throw e
  }
}
