import type { TagField } from '@genshin-optimizer/pando/ui-sheet'
import { isTagField } from '@genshin-optimizer/pando/ui-sheet'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { createTagMap } from '@genshin-optimizer/sr/formula'
import { uiSheets } from './sheets'
import { charBaseUiSheet } from './sheets/CharBase'

const tagValue: Array<{ tag: Tag; value: TagField }> = []
Object.values(uiSheets).forEach((sheet) => {
  Object.values(sheet).forEach(({ documents }) => {
    documents.forEach((document) => {
      if (document.type === 'fields')
        document.fields.forEach((field) => {
          if (!isTagField(field)) return
          tagValue.push({ tag: field.fieldRef, value: field })
        })
    })
  })
})

charBaseUiSheet.forEach((field) => {
  tagValue.push({ tag: field.fieldRef, value: field })
})
export const tagFieldMap = createTagMap(tagValue)
