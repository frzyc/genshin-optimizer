import { ImgIcon } from '@genshin-optimizer/common/ui'
import { discDefIcon, wengineAsset } from '@genshin-optimizer/zzz/assets'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { DiscIds } from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import { Box } from '@mui/material'

const ICON_SIZE = 1.75

export function CompactBuildEquipGrid({
  wengineId,
  discIds,
}: {
  wengineId: string | undefined
  discIds: DiscIds | undefined
}) {
  const discs = useDiscs(discIds)
  const wengine = useWengine(wengineId || undefined)
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        flexWrap: 'nowrap',
        alignItems: 'center',
      }}
    >
      {wengine ? (
        <ImgIcon size={ICON_SIZE} src={wengineAsset(wengine.key, 'icon')} />
      ) : (
        <EmptySlot />
      )}
      {allDiscSlotKeys.map((slot) => {
        const disc = discs[slot]
        return disc ? (
          <ImgIcon key={slot} size={ICON_SIZE} src={discDefIcon(disc.setKey)} />
        ) : (
          <EmptySlot key={slot} />
        )
      })}
    </Box>
  )
}

function EmptySlot() {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  )
}
