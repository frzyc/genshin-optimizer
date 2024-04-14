import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { Typography } from '@mui/material'
import { getCharSheet } from '../../Data/Characters'
import BootstrapTooltip from '../BootstrapTooltip'
import CharIconSide from '../Image/CharIconSide'

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
