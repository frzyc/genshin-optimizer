import {
  type ConditionalDocument,
  type TagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { createTagMap } from '@genshin-optimizer/zzz/formula'
import { discUiSheets } from '../disc'
import { wengineUiSheets } from '../wengine'
import { charBaseUiSheet } from './CharBase'
import { charSheets } from './sheets'
// import { uiSheets } from './sheets'

const tagValue: Array<{ tag: Tag; value: TagField }> = []

Object.values(charSheets).forEach((sheet) =>
  Object.values(sheet).forEach((section) =>
    section.documents.forEach(
      (doc) =>
        doc.type === 'fields' &&
        doc.fields.forEach(
          (field) =>
            isTagField(field) &&
            tagValue.push({ tag: field.fieldRef, value: field })
        )
    )
  )
)
charBaseUiSheet.forEach((field) => {
  tagValue.push({ tag: field.fieldRef, value: field })
})
export const tagFieldMap = createTagMap(tagValue)

// A lookup of sheet:name -> conditional
export const condMap: Map<string, ConditionalDocument['conditional']> =
  new Map()
function addCond(strKey: string, cond: ConditionalDocument['conditional']) {
  if (condMap.get(strKey)) throw new Error(`Duplicate conditional ${strKey}`)
  condMap.set(strKey, cond)
}
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
// TODO: add Character Conditionals
