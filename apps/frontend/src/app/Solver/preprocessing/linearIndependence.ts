import { mapFormulas } from '../../Formula/internal'
import { customRead } from '../../Formula/utils'
import { deleteKey, foldProd, foldSum } from './util'
import type { OptNode } from '../../Formula/optimization'
import type { ArtifactsBySlot } from '../common'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'

/**
 * Use Gaussian Elimination to find all linear dependencies between stats. Modifies `arts` in-place (deletes extraneous keys).
 */
export function makeLinearIndependent(nodes: OptNode[], arts: ArtifactsBySlot) {
  const allKeys = Object.keys(arts.base)
  const allStats = [
    arts.base,
    ...Object.values(arts.values).flatMap((slotArts) =>
      slotArts.map((art) => art.values)
    ),
  ]

  const rows = allKeys.length
  const cols = allStats.length

  // 1. Write all stats into a big ass matrix
  const mat = allKeys.map((k) => allStats.map((dyn) => dyn[k] ?? 0))
  const matInv: number[][] = Array(rows)
    .fill(0)
    .map((_) => Array(cols).fill(0))
  for (let i = 0; i < Math.min(rows, cols); i++) matInv[i][i] = 1

  // 2. Perform Gaussian elimination, tracking all progress in `matInv`
  const selectedPivots = new Set<number>()
  for (let c = 0; c < cols; c++) {
    let pivot = -1
    for (let r = 0; r < rows; r++) {
      if (selectedPivots.has(r)) continue
      if (Math.abs(mat[r][c]) > 1e-8) {
        pivot = r
        break
      }
    }
    if (pivot < 0) continue

    selectedPivots.add(pivot)
    const rp = pivot

    for (let r = 0; r < rows; r++) {
      if (selectedPivots.has(r)) continue
      if (Math.abs(mat[r][c]) > 1e-8) {
        const a = mat[r][c] / mat[rp][c]
        mat[r] = mat[r].map((mr, i) => mr - a * mat[rp][i])
        matInv[r] = matInv[r].map((ri, i) => ri - a * matInv[rp][i])
      }
    }
    if (selectedPivots.size === rows) break
  }
  if (selectedPivots.size === rows) return { arts, nodes } // Full rank => no useless stats

  // 3. Extract linear dependencies and insert them into `nodes`
  for (let n = 0; n < rows; n++) {
    if (selectedPivots.has(n)) continue

    const depOn = matInv[n]
      .map((ri, i) => ({ w: i === n ? 0 : -ri, key: allKeys[i] }))
      .filter(({ w }) => Math.abs(w) > 1e-8)

    const replaceWith = foldSum(
      ...depOn.map(({ w, key }) => foldProd(w, customRead(['dyn', key])))
    )
    nodes = mapFormulas(
      nodes,
      (n) => n,
      (f) => {
        if (f.operation === 'read' && f.path[1] === allKeys[n])
          return replaceWith
        return f
      }
    )
    deleteKey(arts, allKeys[n])
  }

  return { nodes, arts }
}

export function zeroLowerBounds(arts: ArtifactsBySlot) {
  const allKeys = Object.keys(arts.base)
  allKeys.forEach((k) => {
    const minVals = allArtifactSlotKeys.map((slot) =>
      arts.values[slot].length > 0
        ? arts.values[slot].reduce(
            (minv, art) => Math.min(minv, art.values[k] ?? 0),
            Infinity
          )
        : 0
    )

    arts.base[k] += minVals.reduce((tot, minv) => tot + minv, 0)
    allArtifactSlotKeys.forEach((slot, i) => {
      arts.values[slot].forEach((art) => {
        art.values[k] = (art.values[k] ?? 0) - minVals[i]
        if (Math.abs(art.values[k]) < 1e-8) delete art.values[k]
      })
    })
  })
}
