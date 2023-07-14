import type { CharacterKey } from '@genshin-optimizer/consts'
import { Typography } from '@mui/material'
import { getCharSheet } from '../../Data/Characters'
import useDBMeta from '../../ReactHooks/useDBMeta'
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
