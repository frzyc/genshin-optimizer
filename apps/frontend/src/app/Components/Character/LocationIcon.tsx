import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { CharIconSide, CharacterName } from '@genshin-optimizer/gi/ui'
import { Typography } from '@mui/material'

export default function LocationIcon({
  characterKey,
}: {
  characterKey: CharacterKey | ''
}) {
  const { gender } = useDBMeta()
  if (!characterKey) return null
  return (
    <BootstrapTooltip
      placement="right-end"
      title={
        <Typography>
          <CharacterName characterKey={characterKey} gender={gender} />
        </Typography>
      }
    >
      <CharIconSide characterKey={characterKey} sideMargin />
    </BootstrapTooltip>
  )
}
