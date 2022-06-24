import { sum, prod, hashNode, cmpNode } from "./utils"
import { ConstantNode, NumNode } from "./type"
import { allArtifactSets } from "../Types/consts"
import { cartesian } from '../Util/Util'
import { forEachNodes } from "./internal"
import { makeid } from "./optimize2"
import { DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"

function countSlotUsage(node: NumNode): DynStat {
  if (node.operation === 'add') {
    return node.operands.map(n => countSlotUsage(n)).reduce((a, b) => {
      Object.entries(b).forEach(([slotKey, n]) => a[slotKey] = Math.min(n, a[slotKey] ?? 0))
      return a
    }, {})
  }
  else if (node.operation === 'mul') {
    return node.operands.map(n => countSlotUsage(n)).reduce((a, b) => {
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

function filterProductPossible({ terms, nodes }: ExpandedPolynomial, slotsLeft = 5) {
  let sCount = Object.fromEntries(Object.entries(nodes).map(([tag, n]) => [tag, countSlotUsage(n)]))

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

/**
 * Factors damage formula into sums of monomials in each variable.
 * For example:  (1700 * atk_ + atk) * (1 + cr * cd) * (1 + sum_frac(EM))
 *   -> 1700 * atk_ + 1700 * atk_ * cr * cd + 1700 * atk_ * sum_frac(EM) + 1700 * atk_ * cr * cd * sum_frac(EM)
 *            + atk +         atk * cr * cd +         atk * sum_frac(EM) +         atk * cr * cd * sum_frac(EM)
 *
 * For a total of 8 terms, since there are 3 pairs of additions, for 2^3 sum-of-product terms.
 *
 * isVar() is used to check whether any node should be considered a variable on its own.
 */
type NodeLinkedList = { n: NumNode, tag: string, next: NodeLinkedList | undefined }
export function expandPoly(node: NumNode, inheritTags?: string[]): ExpandedPolynomial {
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
  return filterProductPossible({
    terms: sop,
    nodes: tagMap,
  })
}

// Really should avoid using this function ever
export function toNumNode({ nodes, terms }: ExpandedPolynomial) {
  return sum(...terms.map(({ coeff, terms }) => prod(coeff, ...terms.map(t => nodes[t]!))))
}
