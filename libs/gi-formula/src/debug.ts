import type {
  AnyNode,
  CalcResult,
  ReRead,
  TagMapSubsetCache,
} from '@genshin-optimizer/pando'
import {
  Calculator as BaseCalculator,
  TagMapExactValues,
  TagMapKeys,
  traverse,
} from '@genshin-optimizer/pando'
import { res, type Calculator } from './calculator'
import { keys } from './data'
import { tagStr, type Read, type Tag, type TagMapNodeEntry } from './data/util'

const tagKeys = new TagMapKeys(keys)
export const debugKey = Symbol('tagSource')

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
  function printNode(node: AnyNode): string {
    const { op, tag, br, x } = node
    let { ex } = node
    if (op === 'const') return JSON.stringify(ex)
    if (op === 'read') return `${node}`
    if (op === 'subscript') ex = undefined
    const args: string[] = []
    if (ex) args.push(JSON.stringify(ex))
    if (tag) args.push(tagStr(tag))
    args.push(...br.map(printNode), ...x.map(printNode))
    return `${op}(` + args.join(', ') + ')'
  }

  if (value.op === 'reread') return tagStr(tag) + ` <- ` + tagStr(value.tag)
  return tagStr(tag) + ` <= ` + printNode(value)
}

export type DebugMeta = {
  valText: string
  text: string
  deps: DebugMeta[]
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  override computeCustom(val: any[], op: string): any {
    if (op == 'res') return res(val[0])
    return super.computeCustom(val, op)
  }
  override computeMeta(
    n: AnyNode,
    val: number | string,
    x: (CalcResult<number | string, DebugMeta> | undefined)[],
    br: CalcResult<number | string, DebugMeta>[],
    tag: Tag | undefined
  ): DebugMeta {
    const result: DebugMeta = {
      valText: valStr(val),
      text: '',
      deps: [],
    }
    function toStr(
      x: CalcResult<number | string, DebugMeta> | undefined
    ): string {
      if (!x) return ''
      result.deps.push(...x.meta.deps)
      return x.meta.text
    }

    function valStr(val: number | string): string {
      if (typeof val !== 'number') return `"${val}"`
      if (Math.round(val) === val) return `${val}`
      return val.toFixed(2)
    }

    const { op, ex, tag: nTag } = n
    switch (op) {
      case 'const':
        result.text = result.valText
        break
      case 'read': {
        const args = x as CalcResult<number | string, DebugMeta>[]
        return {
          valText: result.valText,
          text: tagStr(nTag!, ex),
          deps: [
            {
              valText: result.valText,
              text: `expand ${tagStr(nTag!, ex)} (${tagStr(tag!)})`,
              deps: args.map(({ meta, entryTag }) => ({
                ...meta,
                text: `${entryTag!.map((tag) => tagStr(tag)).join(' <- ')} <= ${
                  meta.text
                }`,
              })),
            },
          ],
        }
      }
      case 'match':
      case 'thres':
      case 'lookup': {
        const chosen = x.find((x) => x)!
        result.text = `${op}(${br.map(toStr).join(', ')} => ${toStr(chosen)})`
        break
      }
      case 'subscript': {
        const [index] = br
        const chosen = valStr(ex[index.val as number]!)
        result.text = `subscript(${toStr(index)} => ${chosen})`
        break
      }
      case 'tag':
        result.text = `tag(${tagStr(nTag!)}, ${toStr(x[0])})`
        break
      case 'dtag':
        result.text = `dtag(${br
          .map((br, i) => `${ex[i]} => ${toStr(br)}`)
          .join(', ')}; ${toStr(x[0])})`
        break
      default: {
        const specialArgs = ex ? [JSON.stringify(ex)] : []
        const brArgs = br.map(toStr)
        const xArgs = x.map(toStr)
        const args = [specialArgs, brArgs, xArgs].map((x) => x.join(', '))

        result.text = `${op}(` + args.filter((x) => x.length).join('; ') + ')'
      }
    }
    return result
  }

  debug(node: AnyNode): string[] {
    const { meta } = this.compute(node)
    const result: string[] = []
    const found = new Set<DebugMeta>()

    function print(meta: DebugMeta, level: number) {
      const indent = Array(2 * level + 1).join(' ')
      const line = `${meta.valText} ${meta.text}`

      if (found.has(meta)) {
        result.push(indent + line + ' (Dup)')
      } else {
        found.add(meta)
        result.push(indent + line)
        meta.deps.forEach((dep) => print(dep, level + 1))
      }
    }
    print(meta, 0)
    return result
  }
}
