import {
  AnyNode,
  Calculator as BaseCalculator,
  CalcResult,
  ReRead,
  TagMapExactValues,
  TagMapKeys,
  TagMapSubsetCache,
  traverse,
} from '@genshin-optimizer/pando'
import { Calculator, res } from './calculator'
import { keys } from './data'
import { Read, tagStr, type Tag, type TagMapNodeEntry } from './data/util'

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
    function valStr(val: number | string): string {
      if (typeof val !== 'number') return `"${val}"`
      if (Math.round(val) === val) return `${val}`
      return val.toFixed(2)
    }
    const valText = valStr(val)

    const { op, ex, tag: nTag } = n
    switch (op) {
      case 'const':
        return { valText, text: valText, deps: [] }
      case 'read':
        const args = x as CalcResult<number | string, DebugMeta>[]
        return {
          valText,
          text: tagStr(nTag!, ex),
          deps: [
            {
              valText,
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
      case 'match':
      case 'thres':
      case 'lookup':
        const { text, deps } = x.find((x) => x)!.meta
        return {
          valText,
          text: `${op}(${br.map((br) => br.meta.text).join(', ')} => ${text})`,
          deps: [...br.map((br) => br.meta.deps), deps].flat(),
        }
      case 'subscript': {
        const [index] = br
        const chosen = valStr(ex[index.val as number]!)
        return {
          valText,
          text: `subscript(${index.meta.text} => ${chosen})`,
          deps: index.meta.deps,
        }
      }
      case 'tag':
        return {
          ...x[0]!.meta,
          text: `tag(${tagStr(nTag!)}, ${x[0]!.meta.text})`,
        }
      case 'dtag': {
        const brText = br.map((br, i) => `${ex[i]} => ${br.meta.text}`)
        return {
          valText: x[0]!.meta.text,
          text: `dtag(${brText.join(', ')}; ${x[0]!.meta.text})`,
          deps: [...br.map((br) => br.meta.deps), x[0]!.meta.deps].flat(),
        }
      }
      default: {
        const dependencies: DebugMeta[] = []
        function print(
          x: CalcResult<number | string, DebugMeta> | undefined
        ): string {
          if (!x) return ''
          dependencies.push(...x.meta.deps)
          return x.meta.text
        }

        const specialArgs: string[] = []
        if (ex) specialArgs.push(JSON.stringify(ex))
        const brArgs = br.map(print)
        const xArgs = x.map(print)
        const args = [specialArgs, brArgs, xArgs].map((x) => x.join(', '))

        return {
          valText,
          text: `${op}(` + args.filter((x) => x.length).join('; ') + ')',
          deps: dependencies,
        }
      }
    }
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
