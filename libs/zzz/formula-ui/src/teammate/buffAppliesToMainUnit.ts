import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import { type Tag, formulaData } from '@genshin-optimizer/zzz/formula'

const MAIN_UNIT_EFFECT_TYPES = new Set([
  'teamBuff',
  'notOwnBuff',
  'enemyDeBuff',
])

type EffectType =
  | 'teamBuff'
  | 'notOwnBuff'
  | 'enemyDeBuff'
  | 'ownBuff'
  | 'other'

function tagPartsKey(tag: Tag) {
  return [
    tag.sheet,
    tag.qt,
    tag.q,
    tag.attribute ?? '',
    tag.damageType1 ?? '',
    tag.damageType2 ?? '',
    tag.skillType ?? '',
  ].join(':')
}

function buildDisplayBuffEffectMap() {
  const statEntries = formulaData.filter(
    ({ tag }: { tag: Tag }) =>
      tag.et && tag.et !== 'display' && tag.sheet && tag.qt && tag.q
  )
  const statByParts = new Map<string, EffectType[]>()
  for (const { tag } of statEntries) {
    const key = tagPartsKey(tag)
    const et = (tag.et ?? 'other') as EffectType
    const list = statByParts.get(key) ?? []
    list.push(et)
    statByParts.set(key, list)
  }

  const displayToEffect = new Map<string, EffectType>()
  for (const { tag } of formulaData) {
    if (tag.et !== 'display' || !tag.name || !tag.sheet) continue
    const candidates = statByParts.get(tagPartsKey(tag)) ?? []
    const effect =
      pickEffect(candidates, ['teamBuff', 'notOwnBuff', 'enemyDeBuff']) ??
      pickEffect(candidates, ['ownBuff']) ??
      'other'
    displayToEffect.set(displayBuffKey(tag), effect)
  }
  return displayToEffect
}

function pickEffect(candidates: EffectType[], priority: EffectType[]) {
  for (const et of priority) {
    if (candidates.includes(et)) return et
  }
  return undefined
}

function displayBuffKey(tag: Pick<Tag, 'sheet' | 'name'>) {
  return `${tag.sheet}:${tag.name}`
}

const displayBuffEffectMap = buildDisplayBuffEffectMap()

export function buffAppliesToMainUnit(tag: Tag | undefined | null): boolean {
  if (!tag?.sheet || !tag.name) return false
  const effect = displayBuffEffectMap.get(displayBuffKey(tag))
  return !!effect && MAIN_UNIT_EFFECT_TYPES.has(effect)
}

function isTagField(field: Field): field is TagField {
  return 'fieldRef' in field
}

/** Buff names like `m6_common_dmg_` require that mindscape level on the teammate. */
export function isMindscapeGatedBuff(
  buffName: string | null | undefined,
  mindscape: number
): boolean {
  if (!buffName) return false
  const match = buffName.match(/^m(\d)_/)
  if (!match) return false
  return parseInt(match[1], 10) > mindscape
}

export function filterFieldsForMainUnit(
  fields: Field[],
  mindscape?: number
): Field[] {
  return fields.filter((field) => {
    if (!isTagField(field) || !buffAppliesToMainUnit(field.fieldRef))
      return false
    if (
      mindscape !== undefined &&
      isMindscapeGatedBuff(field.fieldRef.name, mindscape)
    )
      return false
    return true
  })
}

export function filterDocumentsForMainUnit(
  documents: Document[],
  options?: { mindscape?: number }
): Document[] {
  const { mindscape } = options ?? {}
  const filtered: Document[] = []
  for (const document of documents) {
    switch (document.type) {
      case 'fields': {
        const fields = filterFieldsForMainUnit(document.fields, mindscape)
        if (fields.length) filtered.push({ ...document, fields })
        break
      }
      case 'conditional': {
        const fields = filterFieldsForMainUnit(
          document.conditional.fields ?? [],
          mindscape
        )
        if (fields.length) {
          filtered.push({
            ...document,
            conditional: { ...document.conditional, fields },
          })
        }
        break
      }
      case 'text':
        break
    }
  }
  return filtered
}

export function filterTeammateDocuments(
  documents: Document[],
  mindscape: number
): Document[] {
  return filterDocumentsForMainUnit(documents, { mindscape })
}

export function hasMainUnitDocuments(documents: Document[]): boolean {
  return filterDocumentsForMainUnit(documents).length > 0
}
