import type {
  AnyNode,
  ReRead,
  Read,
  TagMapSubsetCache,
} from '@genshin-optimizer/pando'
import {
  TagMapExactValues,
  TagMapKeys,
  traverse,
} from '@genshin-optimizer/pando'
import type { Calculator } from './calculator'
import { keys } from './data'
import type { Tag, TagMapNodeEntry } from './data/util'

const tagKeys = new TagMapKeys(keys)

export function dependencyString(read: Read, calc: Calculator) {
  const str = listDependencies(read.tag, calc).map(({ tag, read, reread }) => {
    const result: any = { tag: tagString(tag) }
    if (read.length || reread.length)
      result.deps = [...read.map(tagString), ...reread.map(tagString)]
    return result
  })
  return str
}
export function tagString(tag: Tag): string {
  return `${Object.entries(tag)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(' ')}`
}

export function listDependencies(
  tag: Tag,
  calc: Calculator
): { tag: Tag; read: Tag[]; reread: Tag[] }[] {
  const result: { tag: Tag; read: Tag[]; reread: Tag[] }[] = [],
    stack: Tag[] = []
  /** Stack depth when first encountered the tag, or 0 if already visited */
  const openDepth = new TagMapExactValues<number>(keys.tagLen, {})

  function internal(cache: TagMapSubsetCache<AnyNode | ReRead>) {
    const tag = cache.tag,
      depth = openDepth.refExact(tagKeys.get(tag))
    if (depth[0] > 0) {
      console.log(stack.slice(depth[0] - 1))
      throw new Error('Cyclical dependencies found')
    } else if (depth[0] == 0) return // Already visited
    depth[0] = stack.push(tag)

    const nodes = cache.subset(),
      read: Tag[] = [],
      reread: Tag[] = []
    const n = nodes.filter((x) => x.op !== 'reread') as AnyNode[]
    const re = nodes.filter((x) => x.op === 'reread') as ReRead[]
    result.push({ tag, read, reread })

    const tags = [tag]
    traverse(n, (n, map) => {
      switch (n.op) {
        case 'read': {
          const newTag = cache.with(n.tag)
          read.push(newTag.tag)
          internal(newTag)
          return
        }
        case 'tag': {
          tags.push({ ...tags.at(-1), ...n.tag })
          map(n.x[0])
          tags.pop()
          return
        }
      }
      n.x.forEach(map)
      n.br.forEach(map)
    })

    for (const { tag: extra } of re) {
      const newTag = cache.with(extra)
      internal(newTag)
      reread.push(newTag.tag)
    }

    depth[0] = 0
    stack.pop()
  }
  internal(calc.nodes.cache(calc.keys).with(tag))
  return result
}

export function printEntry({ tag, value }: TagMapNodeEntry): string {
  function printTag(tag: Tag, ex?: string): string {
    const {
      name,
      preset,
      member,
      dst,
      et,
      src,
      region,
      ele,
      q,
      qt,
      move,
      trans,
      amp,
      cata,
      ...remaining
    } = tag

    if (Object.keys(remaining).length) console.error(remaining)

    let result = '{ '
    if (name) result += '#' + name + ' '
    if (preset) result += preset + ' '
    if (member) result += member + ' '
    if (dst) result += `(${dst}) `
    if (src) result += src + ' '
    if (et) result += et + ' '
    if (qt && q) result += `${qt}.${q} `
    else if (qt) result += `${qt}. `
    else if (q) result += `.${q} `
    if (ex) result += `[${ex}] `

    result += '| '

    if (region) result += region + ' '
    if (move) result += move + ' '
    if (ele) result += ele + ' '
    if (trans) result += trans + ' '
    if (amp) result += amp + ' '
    if (cata) result += cata + ' '
    return result + '}'
  }
  function printNode({ op, ex, tag, br, x }: AnyNode): string {
    if (op === 'const') return `${ex}`
    if (op === 'read') return printTag(tag, ex)
    if (op === 'subscript') ex = undefined
    const args: string[] = []
    if (ex) args.push(JSON.stringify(ex))
    if (tag) args.push(printTag(tag))
    args.push(...br.map(printNode), ...x.map(printNode))
    return `${op}(` + args.join(', ') + ')'
  }

  function clean(str: string): string {
    str = str.replaceAll(/\| }/g, '}')
    str = str.replaceAll(/{ \|/g, '{')
    return str
  }
  if (value.op === 'reread')
    return clean(printTag(tag) + ' <-- ' + printTag(value.tag))
  return clean(printTag(tag) + ' <= ' + printNode(value))
}
