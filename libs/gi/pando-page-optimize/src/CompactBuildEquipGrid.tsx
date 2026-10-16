import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { ArtifactCardPico, WeaponCardPico } from '@genshin-optimizer/gi/ui'
import { Box } from '@mui/material'

const PICO_WIDTH_PX = 40

export function CompactBuildEquipGrid({
  weaponId,
  artIds,
  size = PICO_WIDTH_PX,
}: {
  weaponId: string | undefined
  artIds: Partial<Record<ArtifactSlotKey, string | undefined>>
  size?: number
}) {
  const database = useDatabase()
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', alignItems: 'center' }}>
      {weaponId ? (
        <Box sx={{ width: size, flexShrink: 0 }}>
          <WeaponCardPico weaponId={weaponId} />
        </Box>
      ) : null}
      {allArtifactSlotKeys.map((slot) => (
        <Box key={slot} sx={{ width: size, flexShrink: 0 }}>
          <ArtifactCardPico
            slotKey={slot}
            artifactObj={
              artIds[slot] ? database.arts.get(artIds[slot]) : undefined
            }
          />
        </Box>
      ))}
    </Box>
  )
}
