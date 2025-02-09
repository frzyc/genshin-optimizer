import { NextImage } from '@genshin-optimizer/common/ui'
import {
  characterAsset,
  commonDefImages,
  discDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys, discRarityColor } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'

const commonStyles = Object.freeze({
  position: 'absolute' as const,
  borderRadius: '50%',
  width: '34px',
  height: '34px',
})
const stylesMap = {
  '1': {
    top: '5px',
    left: '29px',
    ...commonStyles,
  },
  '2': {
    top: '42px',
    left: '10px',
    ...commonStyles,
  },
  '3': {
    top: '81px',
    left: '29px',
    ...commonStyles,
  },
  '4': {
    top: '81px',
    left: '84px',
    ...commonStyles,
  },
  '5': {
    top: '42px',
    left: '103px',
    ...commonStyles,
  },
  '6': {
    top: '5px',
    left: '84px',
    ...commonStyles,
  },
}

type CommonStyles = typeof commonStyles
type SlotPosition = { top: string; left: string }
type DiscStyles = CommonStyles & SlotPosition

type DiscInfo = {
  key: DiscSlotKey
  styles: DiscStyles
  disc: ICachedDisc | undefined
}

export function CharacterCardEquipment({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { database } = useDatabaseContext()
  const characterDiscs = useMemo(
    () =>
      database.discs.values.filter((disc) => disc.location === characterKey),
    [database.discs.values, characterKey]
  )
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Box
        flexShrink={1}
        component={NextImage ? NextImage : 'img'}
        src={characterAsset(characterKey, 'full')}
        sx={{ maxWidth: '100%' }}
        position="absolute"
        zIndex={0}
        left="-83px"
        top="15px"
      />

      <Discs discs={characterDiscs} />
    </Box>
  )
}
function Discs({ discs }: { discs: ICachedDisc[] }) {
  const mappedDiscs: DiscInfo[] = allDiscSlotKeys.map((slotKey) => ({
    key: slotKey,
    styles: stylesMap[slotKey] || {},
    disc: discs?.find((disc) => disc.slotKey === slotKey),
  }))
  return (
    <Box
      sx={{
        position: 'absolute',
        width: '147px',
        height: '129px',
        top: '75px',
        right: '75px',
        background: `url(${commonDefImages('discDrive')})`,
        backgroundSize: '100% 100%',
        zIndex: '10',
        transform: 'scale(1.96)',
      }}
    >
      {mappedDiscs.map((discInfo: DiscInfo) =>
        discInfo.disc ? (
          <Box key={discInfo.key}>
            <Box
              sx={(theme) => ({
                border: `2px solid ${
                  discInfo.disc?.rarity
                    ? theme.palette[discRarityColor[discInfo.disc.rarity]].main
                    : ''
                }`,
                ...discInfo.styles,
              })}
            >
              <Box
                width="30px"
                height="30px"
                display="flex"
                justifyContent="center"
                sx={{
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component={NextImage ? NextImage : 'img'}
                  src={discDefIcon(discInfo.disc?.setKey)}
                  width="30px"
                  height="30px"
                />
                <Box sx={{ position: 'absolute', bottom: -3 }}>
                  <Typography
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      py: '3px',
                      px: '5px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      lineHeight: '6px',
                      fontSize: '8px',
                    }}
                    variant="subtitle2"
                  >
                    {discInfo.disc.level}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : null
      )}
    </Box>
  )
}
