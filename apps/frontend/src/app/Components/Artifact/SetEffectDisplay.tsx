import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { Box } from '@mui/material'
import { getArtSheet } from '../../Data/Artifacts'
import type { SetNum } from '../../Types/consts'
import DocumentDisplay from '../DocumentDisplay'

type SetEffectDisplayProps = {
  setKey: ArtifactSetKey
  setNumKey: SetNum
  hideHeader?: boolean
  conditionalsOnly?: boolean
  disabled?: boolean
  component?: React.ElementType
}

export default function SetEffectDisplay({
  setKey,
  setNumKey,
  hideHeader = false,
  conditionalsOnly = false,
  disabled = false,
  component,
}: SetEffectDisplayProps) {
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
          component={component}
        />
      ) : null}
    </Box>
  )
}
