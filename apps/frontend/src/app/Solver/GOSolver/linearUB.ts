import { OptNode } from "../../Formula/optimization";
import { cartesian } from "../../Util/Util";
import { ArtifactsBySlot, MinMax, computeFullArtRange } from "../common";
import { Linear } from "./BNBSplitWorker";
import { polyUB } from "./polyUB";
import { solveLP } from "./solveLP_simplex";

function weightedSum(...entries: readonly (readonly [number, Linear])[]): Linear {
  const result = { $c: 0 }
  for (const [weight, entry] of entries)
    for (const [k, v] of Object.entries(entry))
      result[k] = (result[k] ?? 0) + weight * v
  return result
}

export function linearUB(nodes: OptNode[], arts: ArtifactsBySlot) {
  const polys = polyUB(nodes, arts)
  const minMax = computeFullArtRange(arts)

  return polys.map(poly =>
    weightedSum(...poly.map(mon => {
      const bounds = mon.terms.map(key => minMax[key])
      const { w, $c } = lub(bounds)
      const linboi: Linear = { $c }
      mon.terms.forEach((key, i) => linboi[key] = w[i])
      return [mon.$k, linboi] as readonly [number, Linear]
    }))
  )
}

function lub(bounds: MinMax[]): { w: number[], $c: number, err: number } {
  if (bounds.length === 0) return { w: [], $c: 1, err: 0 } // vacuous product is 0
  const nVar = bounds.length

  // Re-scale bounds to [0, 1] for numerical stability.
  const boundScale = bounds.map(({ max }) => max)
  const scaleProd = boundScale.reduce((prod, v) => prod * v, 1)
  bounds = bounds.map(({ min, max }) => ({ min: min / max, max: 1 }))

  // Setting up the linear program in terms of constraints.
  //   cartesian(bounds) loops 2^nVar times
  const cons = cartesian(...bounds.map(({ min, max }) => [min, max])).flatMap((coords) => {
    const prod = coords.reduce((prod, v) => prod * v, 1)
    return [
      [...coords.map(v => -v), 1, 0, -prod],
      [...coords, -1, -1, prod],
    ]
  })

  // Force equality at upper & lower corners?
  // cons.push([...bounds.map(lu => lu.lower), -1, 0, bounds.reduce((prod, { lower }) => prod * lower, 1)])
  // cons.push([...bounds.map(lu => lu.upper), -1, 0, bounds.reduce((prod, { upper }) => prod * upper, 1)])

  const objective = [...bounds.map(_ => 0), 0, 1]
  try {
    // TODO: verify solution
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
    throw e
  }
}
