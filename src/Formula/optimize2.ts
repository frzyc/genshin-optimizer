import { ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common";
import { ArtifactSetKey } from "../Types/consts";
import { reduceFormula, statsUpperLower } from "./addedUtils";
import { foldProd, foldSum } from "./addedUtils";
import { forEachNodes, mapFormulas } from "./internal";
import { Info, NumNode, ReadNode } from "./type";
import { cmp, constant, prod, sum } from './utils';

export function makeid(length: number, disallowed?: string[]) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (let _ = 0; _ < 5; _++) {
    var result = '';
    for (var i = 0; i < length; i++)
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    if (disallowed && disallowed.includes(result)) continue
    return result;
  }
  throw Error('Too many collisions in `makeid`')
}

function readKey(k: string): ReadNode<number> {
  return { operation: "read", operands: [], path: ['dyn', k], type: "number", accu: 'add' }
}

function isShallow(f: NumNode) {
  if (f.operation === 'const' || f.operation === 'read' || f.operation === 'threshold') return true
  if (f.operation !== 'add') return false
  return f.operands.every(n => n.operation === 'const' || n.operation === 'read' || n.operation === 'threshold')
}

function deleteKey(a: ArtifactsBySlot, key: string) {
  delete a.base[key]
  a.values.flower.forEach(art => delete art.values[key])
  a.values.plume.forEach(art => delete art.values[key])
  a.values.sands.forEach(art => delete art.values[key])
  a.values.goblet.forEach(art => delete art.values[key])
  a.values.circlet.forEach(art => delete art.values[key])
}

/**
 * Folds the formula along addable parameters. For example:
 *            `atk + 790 * atk_ + 667` <=> `kf3Dk`
 *   where
 * @param a     ArtifactsBySlot, modified in-place
 * @param nodes Objective function and/or constraints
 */
function collapseAffine(a: ArtifactsBySlot, nodes: NumNode[]) {
  const allKeys = Object.keys(a.base)
  let addedRegisters = {} as { [key: string]: { base: number, coeff: number, sumKeys: string[] } }
  function distributeProd(n: NumNode, v: number) {
    if (!isShallow(n)) throw Error('`distribute` only works on shallow node type.')
    if (v === 1) return n
    switch (n.operation) {
      case 'threshold':
        let [branch, bval, ge, lt] = n.operands
        if (branch.operation === 'read') {
          return cmp(branch, bval, foldProd([ge, constant(v)]), foldProd([lt, constant(v)]), { source: branch.path[1] as ArtifactSetKey })
        }
        console.log(n)
        throw Error('branch is not read...?')
      case 'const':
        return constant(v * n.value)
      case 'add':
        return sum(...n.operands.map(ni => distributeProd(ni, v)))
      case 'read':
        let newID = makeid(5, [...allKeys, ...Object.keys(addedRegisters)])
        addedRegisters[newID] = { base: 0, coeff: v, sumKeys: [n.path[1]] }
        return readKey(newID)
      default:
        throw Error('Should not reach here...')
    }
  }

  const newNodes = mapFormulas(nodes, n => n, f => {
    switch (f.operation) {
      case 'mul':
        let fMops = f.operands
        if (fMops.some(n => n.operation === 'mul')) {
          const toFold = fMops.filter(n => n.operation === 'mul').flatMap(n => [...n.operands]) as NumNode[]
          const orig = fMops.filter(n => n.operation !== 'mul')
          fMops = [...orig, ...toFold]
        }
        if (fMops.every(isShallow) && fMops.some(n => n.operation === 'const')) {
          let coeff = fMops.reduce((coeff, n) => n.operation === 'const' ? coeff * n.value : coeff, 1)
          const todistrib = fMops.filter(n => n.operation !== 'const')
          if (todistrib.length === 0) return constant(coeff)
          const mapped = distributeProd(todistrib.pop()!, coeff)

          if (todistrib.length === 0) return mapped
          return prod(mapped, ...todistrib)
        }
        return f
      case 'add':
        let fAops = f.operands
        if (fAops.some(n => n.operation === 'add')) {
          const toFold = fAops.filter(n => n.operation === 'add').flatMap(n => [...n.operands]) as NumNode[]
          const goodboyes = fAops.filter(n => n.operation !== 'add')
          fAops = [...goodboyes, ...toFold]
        }
        if (fAops.filter(n => n.operation === 'const' || n.operation === 'read').length > 1) {
          const nofold = fAops.filter(n => n.operation !== 'const' && n.operation !== 'read')
          const tofold = fAops.filter(n => n.operation === 'const' || n.operation === 'read')
          let newID = makeid(5, [...allKeys, ...Object.keys(addedRegisters)])
          const base = tofold.reduce((tot, n) => n.operation === 'const' ? tot + n.value : tot, 0)
          const sumKeys = tofold.map(n => n.operation === 'read' ? n.path[1] : undefined).filter(n => n) as string[]
          addedRegisters[newID] = { base, coeff: 1, sumKeys }

          if (nofold.length === 0) return readKey(newID)
          return sum(...nofold, readKey(newID))
        }
        return f
      default:
        return f
    }
  })

  // Add `addedRegisters` to all the stats
  let instKeys = new Set(Object.keys(a.base))
  let resolveStack = Object.entries(addedRegisters)
  while (resolveStack.length > 0) {
    let [s, { base, coeff, sumKeys }] = resolveStack.shift()!
    if (!sumKeys.every(k => instKeys.has(k))) {
      resolveStack.push([s, { base, coeff, sumKeys }])
      continue
    }

    let getV = (stats: DynStat) => {
      return coeff * sumKeys.reduce((v, key) => v + stats[key], 0)
    }

    a.base[s] = base + getV(a.base)
    a.values.flower.forEach(art => art.values[s] = getV(art.values))
    a.values.plume.forEach(art => art.values[s] = getV(art.values))
    a.values.sands.forEach(art => art.values[s] = getV(art.values))
    a.values.goblet.forEach(art => art.values[s] = getV(art.values))
    a.values.circlet.forEach(art => art.values[s] = getV(art.values))

    instKeys.add(s)
  }

  // Remove all unused keys from all the stats
  let unusedKeys = new Set<string>(instKeys)
  forEachNodes(newNodes, _ => { }, n => {
    if (n.operation === 'read') unusedKeys.delete(n.path[1])
  })
  unusedKeys.forEach(k => deleteKey(a, k))

  return { a, nodes: newNodes }
}

export function elimLinDepStats(a: ArtifactsBySlot, nodes: NumNode[]) {
  // Step 1. Find all constants and eliminate them from the equation.
  const { statsMin, statsMax } = statsUpperLower(a)
  nodes = reduceFormula(nodes, statsMin, statsMax);

  // Step 2. Find all sums of variables and constants, and combine these values into named registers
  ({ a, nodes } = collapseAffine(a, nodes))

  // Step 3. Use Gaussian elimination to find all linear dependencies
  const allKeys = Object.keys(a.base)
  const allStats = [a.base, ...Object.values(a.values).flatMap(slotArts => slotArts.map(art => art.values))]

  const rows = allKeys.length
  const cols = allStats.length

  let mat = allKeys.map(k => allStats.map(dyn => dyn[k]))
  let record: number[][] = Array(rows).fill(0).map(_ => Array(rows).fill(0))
  for (let i = 0; i < rows; i++) record[i][i] = 1

  let selectedPivots = new Set<number>()
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
    const j = pivot

    for (let r = 0; r < rows; r++) {
      if (selectedPivots.has(r)) continue
      if (Math.abs(mat[r][c]) > 1e-8) {
        const coeff = mat[r][c] / mat[j][c]
        mat[r] = mat[r].map((mr, i) => mr - coeff * mat[j][i])
        record[r] = record[r].map((ri, i) => ri - coeff * record[j][i])  // record this transform in a matrix
      }
    }
    if (selectedPivots.size === rows) break
  }
  if (selectedPivots.size === rows) {
    return { a, nodes }
  }

  // Step 4. Eliminate the found dependencies.
  for (let n = 0; n < rows; n++) {
    if (!selectedPivots.has(n)) {
      // If the row is linearly dependent on some shit
      let depOn = record[n]
        .map((ri, i) => ({ w: i === n ? 0 : -ri, key: allKeys[i] }))
        .filter(({ w }) => Math.abs(w) > 1e-8)

      if (depOn.some(({ w }) => w < 0)) continue  // Ignore lindep if any negative coeff
      const replaceWith = foldSum(depOn.map(({ w, key }) => w === 1 ? readKey(key) : prod(w, readKey(key))))
      nodes = mapFormulas(nodes, n => n, f => {
        if (f.operation === 'read' && f.path[1] === allKeys[n]) {
          return replaceWith
        }
        return f
      })
      deleteKey(a, allKeys[n])
    }
  }

  return { a, nodes }
}

export function thresholdToConstBranchForm(nodes: NumNode[]) {
  return mapFormulas(nodes, n => n, n => {
    switch (n.operation) {
      case "threshold":
        const [branch, bval, ge, lt] = n.operands
        if (branch.operation === 'threshold' && bval.operation === 'const') {
          // Reserved for non-stacking buffs
          const [br2, bv2, ge2, lt2] = branch.operands
          if (br2.operation === 'read' && bv2.operation === 'const' && ge2.operation === 'const' && lt2.operation === 'const') {
            let left = ge2.value >= bval.value ? ge : lt
            let right = lt2.value >= bval.value ? ge : lt

            console.log('non-stacking buff', n, cmp(br2, bv2, left, right))
            return cmp(br2, bv2, left, right)
          }
          console.log('faulty node:', n)
          throw Error('Not Implemented: nested threshold must follow the form [read, const, const, const]')
        }
        if (ge.operation !== 'const' || lt.operation !== 'const') {
          if (lt.operation === 'const' && lt.value === 0) {
            return prod(cmp(branch, bval, 1, 0), ge)
          }
          console.log('faulty node:', n)
          throw Error('Not Implemented: threshold() node with non-constant `pass` AND non-zero `fail`')
        }

        if (branch.operation !== 'read') {
          console.log('faulty node:', n)
          throw Error('Not Implemented: threshold() node with non-read `branch`')
        }
        return n
      default:
        return n
    }
  })
}
