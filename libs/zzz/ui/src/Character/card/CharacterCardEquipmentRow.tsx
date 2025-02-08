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

const commonStyles = {
  position: 'absolute',
  borderRadius: '50%',
  width: '34px',
  height: '34px',
}
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

type DiscStyles = {
  position: string
  borderRadius: string
  width: string
  height: string
  top: string
  left: string
}

type DiscInfo = {
  key: DiscSlotKey
  styles: DiscStyles
  disc: ICachedDisc
}

export function CharacterCardEquipmentRow({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { database } = useDatabaseContext()
  const getCharacterDiscs = database.discs.values.filter(
    (disc) => disc.location === characterKey
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
        src={characterAsset(characterKey, 'iconGacha')}
        sx={{ maxWidth: '100%' }}
        position="absolute"
        zIndex={0}
        left="-83px"
        top="15px"
      />

      <Discs discs={getCharacterDiscs} />
    </Box>
  )
}
function Discs({ discs }: { discs: ICachedDisc[] }) {
  const mappedDiscs: DiscInfo[] = allDiscSlotKeys.map((slotKey) => ({
    key: slotKey,
    styles: stylesMap[slotKey] || {},
    disc: discs.find((disc) => disc.slotKey === slotKey) as ICachedDisc,
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
      {mappedDiscs.map((discInfo: DiscInfo) => (
        <Box>
          {discInfo.disc && (
            <Box
              sx={(theme) => ({
                border: `2px solid ${
                  theme.palette[discRarityColor[discInfo.disc.rarity]]?.main
                }`,
                ...discInfo.styles,
              })}
            >
              <Box
                width="30px"
                height="30px"
                display="flex"
                justifyContent="center"
              >
                <Box
                  component={NextImage ? NextImage : 'img'}
                  src={discDefIcon(discInfo.disc?.setKey)}
                  width="30px"
                  height="30px"
                />
                <Box sx={{ position: 'absolute', bottom: 0 }}>
                  <Typography
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      pt: '3px',
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
          )}
        </Box>
      ))}
    </Box>
  )
}
