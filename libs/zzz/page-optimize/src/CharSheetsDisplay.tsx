import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { buffs } from '@genshin-optimizer/zzz/formula'
import { TagDisplay, charSheets } from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/material'

export function CharSheetSection() {
  const { key: characterKey } = useCharacterContext()!
  return (
    <Box>
      {characterKey === 'Yixuan' && <MinimalYixuanSheet />}
      {shouldShowDevComponents &&
        Object.values(charSheets[characterKey]).flatMap((sheet, index1) =>
          sheet.documents.map((doc, index2) => (
            <DocumentDisplay
              key={`${index1}_${index2}`}
              document={doc}
              collapse
            />
          ))
        )}
    </Box>
  )
}

const yixuanDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Yixuan's HP to Sheer Force at a ratio of 1:0.1. Everything else in her kit is not factored, such as the DMG Bonus % added in her Core skill",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={buffs.Yixuan.core_hpSheerForce.tag} />,
        fieldRef: buffs.Yixuan.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalYixuanSheet() {
  return (
    <>
      {yixuanDocs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </>
  )
}
