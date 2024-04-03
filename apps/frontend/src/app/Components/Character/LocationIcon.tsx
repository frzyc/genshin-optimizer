import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { CharIconSide } from '@genshin-optimizer/gi/ui'
import { Typography } from '@mui/material'
import { getCharSheet } from '../../Data/Characters'

export default function LocationIcon({
  characterKey,
}: {
  characterKey: CharacterKey | ''
}) {
  const { gender } = useDBMeta()
  if (!characterKey) return null
  const characterSheet = getCharSheet(characterKey, gender)
  if (!characterSheet) return null
  return (
    <BootstrapTooltip
      placement="right-end"
      title={<Typography>{characterSheet.name}</Typography>}
    >
      <CharIconSide characterKey={characterKey} sideMargin />
    </BootstrapTooltip>
  )
}
