import type { Field, TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/gi/formula'
import {
  createTagMap,
  formulaCatalog,
  formulas,
  isParamOnlyEntry,
  STAT_SHEET,
  stripCalcContextTag,
} from '@genshin-optimizer/gi/formula'
import { catalogListingDisplayTitle } from '../tagLabel'
import { uiSheets } from './sheets'

function buildTagFieldMap() {
  const tagValue: Array<{ tag: Tag; value: TagField }> = []

  function addField(field: Field) {
    if (isTagField(field)) {
      tagValue.push({ tag: field.fieldRef, value: field })
      return
    }
    if (isMultiTagField(field)) {
      for (const { ref } of field.fieldRefs) {
        const mapped: TagField = {
          title: field.title,
          fieldRef: ref,
          subtitle: field.subtitle,
          icon: field.icon,
        }
        tagValue.push({ tag: ref, value: mapped })
      }
    }
  }

  Object.values(uiSheets).forEach((sheet) =>
    Object.values(sheet ?? {}).forEach((section) =>
      section?.documents.forEach((doc) => {
        if (doc.type === 'fields') doc.fields.forEach(addField)
        if (doc.type === 'conditional')
          doc.conditional.fields?.forEach(addField)
      })
    )
  )

  const authored = createTagMap<TagField>(tagValue)

  for (const [sheetKey, catalog] of Object.entries(formulaCatalog)) {
    if (sheetKey === STAT_SHEET) continue
    const charFormulas = (formulas as Record<string, Record<string, { tag: Tag }>>)[
      sheetKey
    ]
    if (!charFormulas) continue

    for (const entry of Object.values(catalog)) {
      if (isParamOnlyEntry(entry)) continue
      const formulaObj = charFormulas[entry.name]
      if (!formulaObj?.tag) continue
      const tag = formulaObj.tag
      if (authored.subset(stripCalcContextTag(tag)).length) continue
      tagValue.push({
        tag,
        value: {
          title: catalogListingDisplayTitle(entry.name),
          fieldRef: tag,
        },
      })
    }
  }

  return createTagMap<TagField>(tagValue)
}

let tagFieldMap: ReturnType<typeof buildTagFieldMap> | undefined

function ensureTagFieldMap() {
  if (!tagFieldMap) tagFieldMap = buildTagFieldMap()
  return tagFieldMap
}

export function tagFieldSubset(tag: Tag) {
  return ensureTagFieldMap().subset(stripCalcContextTag(tag))
}
