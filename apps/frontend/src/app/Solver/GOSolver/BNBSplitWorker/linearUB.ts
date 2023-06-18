import type { OptNode } from '../../../Formula/optimization'
import { assertUnreachable, cartesian } from '../../../Util/Util'
import type { ArtifactsBySlot, DynStat, MinMax } from '../../common'
import { computeFullArtRange } from '../../common'
import { polyUB } from './polyUB'
import { solveLP } from './solveLP'

export type Linear = DynStat & { $c: number }

function weightedSum(
  ...entries: readonly (readonly [number, Linear])[]
): Linear {
  const result = { $c: 0 }
  for (const [weight, entry] of entries)
    for (const [k, v] of Object.entries(entry))
      result[k] = (result[k] ?? 0) + weight * v
  return result
}

export function linearUB(nodes: OptNode[], arts: ArtifactsBySlot): Linear[] {
  const polys = polyUB(nodes, arts)
  const minMax = computeFullArtRange(arts)

  return polys.map((poly) =>
    weightedSum(
      ...poly.map((mon) => {
        const bounds = mon.terms.map((key) => minMax[key])
        const { w, $c } = linbound(bounds, mon.$k >= 0 ? 'upper' : 'lower')
        const linboi: Linear = { $c }
        mon.terms.forEach((key, i) => (linboi[key] = w[i] + (linboi[key] ?? 0)))
        return [mon.$k, linboi] as readonly [number, Linear]
      })
    )
  )
}

/**
 * Constructs a linear upper/lower bound for a monomial on a bounded domain using an LP.
 *
 * Monomial is assumed to be
 *    m(x) = x1 * x2 * ... * xn
 * on bounded domain
 *    min_1 <= x1 <= max_1
 *    min_2 <= x2 <= max_2
 *    ...
 *    min_n <= xn <= max_n
 *
 * @param bounds List of min & max bounds for each xi
 * @returns A linear function L(x) = w . x + $c
 *            satisfying      m(x) <= L(x) <= m(x) + err (resp. m(x) - err <= L(x) <= m(x))
 */
function linbound(
  bounds: MinMax[],
  direction: 'upper' | 'lower' = 'upper'
): { w: number[]; $c: number; err: number } {
  if (bounds.length === 0) return { w: [], $c: 1, err: 0 } // vacuous product is 0
  const nVar = bounds.length

  // Re-scale bounds to [-1, 1] for numerical stability.
  const boundScale = bounds.map(({ min, max }) => Math.max(-min, max))
  if (boundScale.some((bnd) => bnd === 0)) {
    return { w: bounds.map((_) => 0), $c: 0, err: 0 }
  }
  const scaleProd = boundScale.reduce((prod, v) => prod * v, 1)
  bounds = bounds.map(({ min, max }, i) => ({
    min: min / boundScale[i],
    max: max / boundScale[i],
  }))
  // Setting up the linear program in terms of constraints.
  //   cartesian(bounds) loops 2^nVar times
  const cons = cartesian(...bounds.map(({ min, max }) => [min, max])).flatMap(
    (coords) => {
      const prod = coords.reduce((prod, v) => prod * v, 1)
      const sum = coords.reduce((sum, v) => sum + v, 0)
      switch (direction) {
        case 'upper':
          return [
            [...coords, -1, 0, sum - prod - nVar],
            [...coords.map((v) => -v), 1, -1, nVar + prod - sum],
          ]
        case 'lower':
          return [
            [...coords.map((v) => -v), -1, 0, prod - sum - nVar],
            [...coords, 1, -1, nVar + sum - prod],
          ]
        default:
          assertUnreachable(direction)
      }
    }
  )

  const objective = [...bounds.map((_) => 0), 0, 1]
  try {
    const soln = solveLP(objective, cons)
    switch (direction) {
      case 'upper':
        return {
          w: soln
            .slice(0, nVar)
            .map((wi, i) => ((1 - wi) * scaleProd) / boundScale[i]),
          $c: scaleProd * (soln[nVar] - nVar),
          err: scaleProd * soln[nVar + 1],
        }
      case 'lower':
        return {
          w: soln
            .slice(0, nVar)
            .map((wi, i) => ((1 - wi) * scaleProd) / boundScale[i]),
          $c: scaleProd * (nVar - soln[nVar]),
          err: scaleProd * soln[nVar + 1],
        }
      default:
        assertUnreachable(direction)
    }
  } catch (e) {
    console.log('ERROR on bounds', bounds)
    console.log('Possibly numerical instability issue.')
    console.log(e)
    throw e
  }
}
