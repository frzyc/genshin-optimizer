import { constant, sum, prod, hashNode, cmpNode } from "./utils"
import { ConstantNode, NumNode } from "./type"
import { allArtifactSets } from "../Types/consts"
import { cartesian } from '../Util/Util'
import { forEachNodes, mapFormulas } from "./internal"
import { makeid } from "./optimize2"
import { DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { reduceFormula, reduceFormula2 } from "./addedUtils"
import { toLinearUpperBound, toLinearUpperBound2 } from "./linearUpperBound"

export function foldSum(nodes: readonly NumNode[]) {
  if (nodes.length === 1) return nodes[0]
  nodes = nodes.flatMap(n => n.operation === 'add' ? n.operands : n)
  let constVal = nodes.reduce((pv, n) => n.operation === 'const' ? pv + n.value : pv, 0)
  nodes = nodes.filter(n => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 0) return sum(...nodes)
  return sum(...nodes, constant(constVal))
}

export function foldProd(nodes: readonly NumNode[]) {
  if (nodes.length === 1) return nodes[0]
  nodes = nodes.flatMap(n => n.operation === 'mul' ? n.operands : n)
  let constVal = nodes.reduce((pv, n) => n.operation === 'const' ? pv * n.value : pv, 1)
  nodes = nodes.filter(n => n.operation !== 'const')

  if (nodes.length === 0) return constant(constVal)
  if (constVal === 1) return prod(...nodes)
  return prod(...nodes, constant(constVal))
}

/**
 * Factors damage formula into pure polynomials of each variable.
 * For example:  (1700 * atk_ + atk) * (1 + cr * cd) * (1 + sum_frac(EM))
 *   -> 1700 * atk_ + 1700 * atk_ * cr * cd + 1700 * atk_ * sum_frac(EM) + 1700 * atk_ * cr * cd * sum_frac(EM)
 *            + atk +         atk * cr * cd +         atk * sum_frac(EM) +         atk * cr * cd * sum_frac(EM)
 *
 * For a total of 8 terms, since there are 3 pairs of additions, for 2^3 sum-of-product terms.
 *
 * isVar() is used to check whether any node should be considered a variable on its own.
 */
export function expandPoly(node: NumNode, isVar: (n: NumNode) => boolean) {
  let expanded = mapFormulas([node], n => n, f => {
    switch (f.operation) {
      case 'mul':
        let ops = f.operands.map(n => n.operation === 'add' ? n.operands : [n])
          .map((ns, i) => {
            const varExprs = ns.map(n => isVar(n) || (n.operation === 'mul' && n.operands.some(isVar)))
            let vars = ns.filter((n, i) => varExprs[i])
            let nonVars = ns.filter((n, i) => !varExprs[i])

            if (nonVars.length === 0) return vars
            return [...vars, foldSum(nonVars)]
          })
        const products = cartesian(...ops).map(ns => foldProd(ns))
        return foldSum(products)
      case 'add':
        let op2 = f.operands.flatMap(n => n.operation === 'add' ? n.operands : n)
        return foldSum(op2)
      default:
        return f
    }
  })[0]

  return expanded
}

/**
 * Assumes we've expanded the damage formula into sum-of-products form.
 * Prunes formulas that are unreachable due to not enough slots.
 */
export function productPossible(node: NumNode) { return countSlotUsage(node) <= 5 }

function countSlotUsage(node: NumNode) { return Object.values(countSlotUsageHelper(node)).reduce((cnt, c) => cnt + c, 0) }
function countSlotUsageHelper(node: NumNode): DynStat {
  if (node.operation === 'add') {
    return node.operands.map(n => countSlotUsageHelper(n)).reduce((a, b) => {
      Object.entries(b).forEach(([slotKey, n]) => a[slotKey] = Math.min(n, a[slotKey] ?? 0))
      return a
    }, {})
  }
  else if (node.operation === 'mul') {
    return node.operands.map(n => countSlotUsageHelper(n)).reduce((a, b) => {
      Object.entries(b).forEach(([slotKey, n]) => a[slotKey] = Math.max(n, a[slotKey] ?? 0))
      return a
    }, {})
  }
  else if (node.operation === 'threshold') {
    const branch = node.operands[0]
    if (branch.operation === 'read' && (allArtifactSets as readonly string[]).includes(branch.path[1])) {
      let con = node.operands[1] as ConstantNode<number>
      return { [branch.path[1]]: con.value }
    }
  }
  return {}
}

function filterProductPossible2({ terms, nodes }: ExpandedPolynomial, slotsLeft = 5) {
  let sCount = Object.fromEntries(Object.entries(nodes).map(([tag, n]) => [tag, countSlotUsageHelper(n)]))

  terms = terms.filter(({ terms }) => {
    const slotUsage = terms.reduce((tot, s) => {
      Object.entries(sCount[s]).forEach(([slotKey, n]) => tot[slotKey] = Math.max(n, tot[slotKey] ?? 0))
      return tot
    }, {} as DynStat)
    return Object.values(slotUsage).reduce((a, b) => a + b, 0) <= slotsLeft
  })
  return { terms, nodes }
}

export type Monomial = {
  coeff: number,
  terms: string[]
}
export type ExpandedPolynomial = {
  terms: Monomial[],
  nodes: Dict<string, NumNode>,
}

export function sumM(...monomials: Monomial[][]): Monomial[] {
  return monomials.flat()
}
export function prodM(...monomials: Monomial[][]): Monomial[] {
  return cartesian(...monomials).map(monos => monos.reduce((ret, nxt) => {
    ret.coeff *= nxt.coeff
    ret.terms.push(...nxt.terms)
    return ret
  }, { coeff: 1, terms: [] }))
}
export function constantM(v: number): Monomial[] {
  return [{ coeff: v, terms: [] }]
}
export function readM(tag: string): Monomial[] {
  return [{ coeff: 1, terms: [tag] }]
}

export function foldLikeTerms(mono: Monomial[]): Monomial[] {
  let mon = [...mono]
  mon.forEach(m => m.terms.sort())
  mon.sort(({ terms: termsA }, { terms: termsB }) => {
    if (termsA.length !== termsB.length) return termsA.length - termsB.length
    for (let i = 0; i < termsA.length; i++) {
      if (termsA[i] !== termsB[i]) return termsA[i] < termsB[i] ? -1 : 1
    }
    return 0
  })

  for (let i = mon.length - 2; i >= 0; i--) {
    let a = mon[i].terms
    let b = mon[i + 1].terms
    if (a.length !== b.length) continue
    if (a.every((ai, i) => ai === b[i])) {
      mon[i].coeff = (mon[i].coeff ?? 0) + (mon[i + 1].coeff ?? 0)
      mon.splice(i + 1, 1)
    }
  }
  return mon
}

type NodeLinkedList = { n: NumNode, tag: string, next: NodeLinkedList | undefined }
export function expandPoly2(node: NumNode, inheritTags?: string[]): ExpandedPolynomial {
  let varMap = {} as Dict<number, NodeLinkedList> // my shitty hashmap
  let tagMap = {} as Dict<string, NumNode>
  const varTags = inheritTags ?? []
  function lookup(n: NumNode) {
    let hsh = hashNode(n)
    let z = varMap[hsh]
    while (z !== undefined) {
      if (cmpNode(z.n, n)) return z.tag
      z = z.next
    }
    const newTag = makeid(10, varTags)
    varMap[hsh] = { n, tag: newTag, next: varMap[hsh] }
    tagMap[newTag] = n
    varTags.push(newTag)
    return newTag
  }

  let stat2tag = {} as Dict<string, string>
  forEachNodes([node], _ => { }, n => {
    if (n.operation === 'read') stat2tag[n.path[1]] = lookup(n as NumNode)
  })

  function toSOP(n: NumNode): Monomial[] {
    switch (n.operation) {
      case 'add':
        return sumM(...n.operands.map(toSOP))
      case 'mul':
        return prodM(...n.operands.map(toSOP))
      case 'const':
        return constantM(n.value)
      default:
        return readM(lookup(n))
    }
  }

  // let sop = toSOP(node)
  let sop = foldLikeTerms(toSOP(node))
  return filterProductPossible2({
    terms: sop,
    nodes: tagMap,
  })
}

export function toNumNode({ nodes, terms }: ExpandedPolynomial) {
  return sum(...terms.map(({ coeff, terms }) => prod(coeff, ...terms.map(t => nodes[t]!))))
}

export function debugExpandPoly(f: NumNode) {
  function isVar(n: NumNode) {
    switch (n.operation) {
      case 'read': case 'max': case 'min': case 'sum_frac': case 'threshold': case 'res': return true
      default: return false
    }
  }

  let zz = expandPoly(f, isVar).operands as NumNode[]
  zz = zz.filter(productPossible)
  const www = expandPoly2(f)

  // console.log(zz.filter(productPossible))
  // console.log(www)

  const lower: DynStat = {
    "0": 0,
    "1": 0.05,
    "2": 0.5,
    "3": 0.05,
    "4": 0.5,
    "EmblemOfSeveredFate": 0,
    "enerRech_": 0,
    "EchoesOfAnOffering": 0,
    "GladiatorsFinale": 0,
    "ResolutionOfSojourner": 0,
    "ShimenawasReminiscence": 0,
    "VermillionHereafter": 0,
    "atk": 311,
    "NoblesseOblige": 0,
    "ViridescentVenerer": 0,
    "anemo_dmg_": 0,
    "BlizzardStrayer": 0,
    "cryo_dmg_": 0,
    "WanderersTroupe": 0,
    "eleMas": 0
  }
  const upper: DynStat = {
    "0": 0,
    "1": 1.05,
    "2": 2.5,
    "3": 1.05,
    "4": 2.5,
    "EmblemOfSeveredFate": 4,
    "enerRech_": 1.62,
    "EchoesOfAnOffering": 0,
    "GladiatorsFinale": 0,
    "ResolutionOfSojourner": 0,
    "ShimenawasReminiscence": 0,
    "VermillionHereafter": 0,
    "atk": 311,
    "NoblesseOblige": 0,
    "ViridescentVenerer": 4,
    "anemo_dmg_": .46,
    "BlizzardStrayer": 3,
    "cryo_dmg_": .46,
    "WanderersTroupe": 0,
    "eleMas": 0
  }

  // const www = expandPoly2(f)
  let [f2] = reduceFormula([f], lower, upper)
  const [ww2] = reduceFormula2([www], lower, upper)

  zz = expandPoly(f2, isVar).operands as NumNode[]
  zz = zz.filter(productPossible)
  let linubs = zz.flatMap(n => toLinearUpperBound(n, lower, upper))
  let lub1 = linubs.reduce((pv, lin) => {
    Object.entries(lin.w).forEach(([k, v]) => pv.w[k] = v + (pv.w[k] ?? 0))
    return { w: pv.w, c: pv.c + lin.c, err: pv.err + lin.err }
  }, { w: {}, c: 0, err: 0 })

  console.log(ww2)
  console.log(zz)

  console.log('oldLUB', lub1)
  console.log('newLUB', toLinearUpperBound2(ww2, lower, upper))
  throw Error('die')
}

// function gatherSumOfProds(products: NumNode[], isVar: (n: NumNode) => boolean): NumNode[] {
// return products
// type NodeLinkedList = { n: NumNode, ix: number, next: NodeLinkedList | undefined }
// let varMap = {} as Dict<number, NodeLinkedList> // my shitty hashmap
// const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541]
// let varCounter = 0
// function lookup(n: NumNode) {
//   let hsh = hashNode(n)
//   let z = varMap[hsh]
//   while (z !== undefined) {
//     if (cmpNode(z.n, n)) return BigInt(z.ix)
//     z = z.next
//   }

//   const ix = primes[varCounter]
//   varMap[hsh] = { n, ix, next: varMap[hsh] }
//   varCounter += 1
//   return BigInt(ix)
// }

// let result: { [k: string]: { coeff: number, rhs: NumNode[] } } = {}
// products.forEach(n => {
//   if (n.operation === 'const') {
//     result[1] = { coeff: n.value + (result[1]?.coeff ?? 0), rhs: [] }
//     return
//   }
//   else if (isVar(n)) {
//     let ix = lookup(n).toString()
//     result[ix] = { coeff: 1 + (result[ix]?.coeff ?? 0), rhs: [n] }
//     return
//   }
//   else if (n.operation === 'mul') {
//     const { coeff, ix, ops } = n.operands.reduce(({ coeff, ix, ops }, n) => {
//       if (n.operation === 'const') return { coeff: coeff * n.value, ix, ops }
//       ops.push(n)
//       return { coeff, ix: ix * lookup(n), ops: ops }
//     }, { coeff: 1, ix: BigInt(1), ops: [] as NumNode[] })
//     let ix2 = ix.toString()
//     result[ix2] = { coeff: coeff + (result[ix2]?.coeff ?? 0), rhs: ops }
//     return
//   }
//   console.log(n)
//   throw Error('Encountered unexpected node in `gatherSumOfProds`')
// })
// return Object.entries(result).map(([k, { coeff, rhs }]) => {
//   return foldProd([...rhs, constant(coeff)])
// })
// }
