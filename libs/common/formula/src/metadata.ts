import { traverse } from '@genshin-optimizer/pando/engine'

import type {
  AnyNode,
  ReRead,
  Tag,
  TagMapEntries,
} from '@genshin-optimizer/pando/engine'
import type {
  IBareConditionalData,
  IConditionalData,
  IFormulaData,
} from './IConditionalData'

type Conditionals = Record<string, Record<string, IConditionalData>>
type Formulas<T> = Record<string, Record<string, IFormulaData<T>>>

const condMeta = Symbol.for('condMeta')

export function extractCondMetadata(
  data: TagMapEntries<AnyNode | ReRead>,
  extractCond: (tag: Tag) => { sheet: string; name: string }
) {
  const result: Conditionals = {}
  traverse(
    data.map((e) => e.value).filter((v) => v.op !== 'reread'),
    (n, visit) => {
      const meta = n.tag?.[condMeta as any] as IBareConditionalData | undefined
      if (!meta) {
        n.x.forEach(visit)
        n.br.forEach(visit)
        return
      }
      const { sheet, name } = extractCond(n.tag!)
      result[sheet] ??= {}
      if (result[sheet][name])
        console.log(`Duplicated conditionals for ${sheet}:${name}`)
      result[sheet][name] = { sheet, name, ...meta! }
    }
  )
  return sortMeta(result)
}

export function extractFormulaMetadata<T>(
  data: TagMapEntries<AnyNode | ReRead>,
  extractFormula: (
    tag: Tag,
    value: AnyNode | ReRead
  ) => IFormulaData<T> | undefined
) {
  const result: Formulas<T> = {}
  for (const { tag, value } of data) {
    const extracted = extractFormula(tag, value)
    if (!extracted) continue
    const { sheet, name } = extracted
    result[sheet] ??= {}
    if (result[sheet][name])
      console.log(`Duplicated formula definition for ${sheet}:${name}`)
    result[sheet][name] = extracted
  }
  return sortMeta(result)
}

function sortMeta<T>(
  obj: Record<string, Record<string, T>>
): Record<string, Record<string, T>> {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => [k, Object.fromEntries(Object.entries(v).sort())])
      .sort()
  )
}
