import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { charSheets } from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/material'

export function CharSheetSection() {
  const { key: characterKey } = useCharacterContext()!
  return (
    <Box>
      {Object.values(charSheets[characterKey]).flatMap((sheet, index1) =>
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
