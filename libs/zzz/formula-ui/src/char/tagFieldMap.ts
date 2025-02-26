import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { createTagMap } from '@genshin-optimizer/zzz/formula'
import { charBaseUiSheet } from './CharBase'
// import { uiSheets } from './sheets'

const tagValue: Array<{ tag: Tag; value: TagField }> = []
// Object.values(uiSheets).forEach((sheet) => {
//   Object.values(sheet).forEach(({ documents }) => {
//     documents.forEach((document) => {
//       if (document.type === 'fields')
//         document.fields.forEach((field) => {
//           if (!isTagField(field)) return
//           tagValue.push({ tag: field.fieldRef, value: field })
//         })
//     })
//   })
// })

charBaseUiSheet.forEach((field) => {
  tagValue.push({ tag: field.fieldRef, value: field })
})
export const tagFieldMap = createTagMap(tagValue)
