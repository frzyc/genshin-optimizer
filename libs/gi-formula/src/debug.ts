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
  text: string
  dependencies: DebugMeta[]
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  override computeCustom(val: any[], op: string): any {
    if (op == 'res') return res(val[0])
    return super.computeCustom(val, op)
  }
  override computeMeta(
    { op, ex, tag: nTag }: AnyNode,
    val: any,
    x: (CalcResult<any, DebugMeta> | undefined)[],
    br: CalcResult<any, DebugMeta>[],
    tag: Tag | undefined
  ): DebugMeta {
    if (op === 'const') return { text: JSON.stringify(val), dependencies: [] }
    if (op === 'read') {
      const args = x as CalcResult<any, DebugMeta>[]
      const extraTag = Object.fromEntries(
        Object.entries(tag!).filter(([key]) => !nTag![key])
      )
      return {
        text: tagStr(nTag!, ex) + `(+ ${tagStr(extraTag!)})`,
        dependencies: [
          {
            text: 'expand ' + tagStr(tag!, ex),
            dependencies: args.map(({ val, meta, entryTag }) => {
              return {
                text: `${entryTag!
                  .map((tag) => tagStr(tag))
                  .join(' <- ')} <= (${val}) ${meta.text}`,
                dependencies: meta.dependencies,
              }
            }),
          },
        ],
      }
    }
    if (op === 'subscript') ex = undefined

    const dependencies: DebugMeta[] = []
    function print(x: CalcResult<any, DebugMeta> | undefined): string {
      if (!x) return ''
      dependencies.push(...x.meta.dependencies)
      return x.meta.text
    }

    const specialArgs: string[] = []
    if (ex) specialArgs.push(JSON.stringify(ex))
    if (tag) specialArgs.push(tagStr(tag))
    const brArgs = br.map(print)
    const xArgs = x.map(print)
    const args = [specialArgs, brArgs, xArgs].map((x) => x.join(', '))

    return {
      text: `${op}(` + args.filter((x) => x.length).join('; ') + ')',
      dependencies,
    }
  }

  debug(node: AnyNode): string[] {
    const { meta } = this.compute(node)
    const result: string[] = []

    function print(meta: DebugMeta, level: number) {
      result.push(Array(2 * level + 1).join(' ') + meta.text)
      meta.dependencies.forEach((dep) => print(dep, level + 1))
    }
    print(meta, 0)
    return result
  }
}
