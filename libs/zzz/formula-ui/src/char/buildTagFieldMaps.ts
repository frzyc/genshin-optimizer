import { ColorText } from '@genshin-optimizer/common/ui'
import {
  type ConditionalDocument,
  type Field,
  isMultiTagField,
  isTagField,
  type MultiTagField,
  type TagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { createTagMap } from '@genshin-optimizer/zzz/formula'
import { createElement } from 'react'
import { discUiSheets } from '../disc/sheets'
import { wengineUiSheets } from '../wengine/sheets'
import { abilityFormulaLabel } from './abilityFormulaLabels'
import { charBaseUiSheet } from './CharBase'
import { charSheets } from './sheets'
import { getVariant } from './util'

function titleForBundledRef(field: MultiTagField, ref: Tag) {
  const sheet = ref.sheet
  if (sheet && allCharacterKeys.includes(sheet as CharacterKey)) {
    const label = abilityFormulaLabel(sheet as CharacterKey, ref)
    if (label)
      return createElement(ColorText, { color: getVariant(ref) }, label)
  }
  return field.title
}

export function buildTagFieldMaps() {
  const tagValue: Array<{ tag: Tag; value: TagField }> = []
  const condMap = new Map<string, ConditionalDocument['conditional']>()

  function addFieldToTagMap(field: Field) {
    if (isTagField(field)) {
      tagValue.push({ tag: field.fieldRef, value: field })
      return
    }
    if (isMultiTagField(field)) {
      for (const { ref } of field.fieldRefs) {
        tagValue.push({
          tag: ref,
          value: {
            title: titleForBundledRef(field, ref),
            fieldRef: ref,
            subtitle: field.subtitle,
            icon: field.icon,
          },
        })
      }
    }
  }

  function addCond(strKey: string, cond: ConditionalDocument['conditional']) {
    const existing = condMap.get(strKey)
    if (existing) {
      if (existing.metadata !== cond.metadata) {
        throw new Error(`Duplicate conditional ${strKey}`)
      }
      return
    }
    condMap.set(strKey, cond)
  }

  Object.values(charSheets).forEach((sheet) =>
    Object.values(sheet).forEach((section) =>
      section.documents.forEach((doc) => {
        if (doc.type === 'fields') doc.fields.forEach(addFieldToTagMap)
        if (doc.type === 'conditional')
          addCond(
            `${doc.conditional.metadata.sheet}:${doc.conditional.metadata.name}`,
            doc.conditional
          )
      })
    )
  )
  charBaseUiSheet.forEach((field) => {
    tagValue.push({ tag: field.fieldRef, value: field })
  })

  Object.values(wengineUiSheets).forEach(({ documents }) => {
    documents.forEach((document) => {
      document.type === 'conditional' &&
        addCond(
          `${document.conditional.metadata.sheet}:${document.conditional.metadata.name}`,
          document.conditional
        )
    })
  })
  Object.values(discUiSheets).forEach((sheets) =>
    Object.values(sheets).forEach(({ documents }) => {
      documents.forEach((document) => {
        document.type === 'conditional' &&
          addCond(
            `${document.conditional.metadata.sheet}:${document.conditional.metadata.name}`,
            document.conditional
          )
      })
    })
  )

  return {
    tagFieldMap: createTagMap<TagField>(tagValue),
    condMap,
  }
}
