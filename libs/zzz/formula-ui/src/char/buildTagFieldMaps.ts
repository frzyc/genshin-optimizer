import {
  type ConditionalDocument,
  type Field,
  type TagField,
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { createTagMap } from '@genshin-optimizer/zzz/formula'
import { discUiSheets } from '../disc/sheets'
import { wengineUiSheets } from '../wengine/sheets'
import { charBaseUiSheet } from './CharBase'
import { charSheets } from './sheets'

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
            title: field.title,
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
