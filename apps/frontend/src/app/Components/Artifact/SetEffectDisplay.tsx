import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { Box } from '@mui/material'
import { getArtSheet } from '../../Data/Artifacts'
import type { SetNum } from '../../Types/consts'
import DocumentDisplay from '../DocumentDisplay'

type Data = {
  setKey: ArtifactSetKey
  setNumKey: SetNum
  hideHeader?: boolean
  conditionalsOnly?: boolean
  disabled?: boolean
}

export default function SetEffectDisplay({
  setKey,
  setNumKey,
  hideHeader = false,
  conditionalsOnly = false,
  disabled = false,
}: Data) {
  const sheet = getArtSheet(setKey)

  const document = conditionalsOnly
    ? sheet
        .setEffectDocument(setNumKey)
        ?.filter((section) => 'states' in section)
    : sheet.setEffectDocument(setNumKey)
  return (
    <Box display="flex" flexDirection="column">
      {document ? (
        <DocumentDisplay
          sections={document}
          hideHeader={hideHeader}
          disabled={disabled}
        />
      ) : null}
    </Box>
  )
}
