import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import {
  characterAsset,
  commonDefImages,
  discDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Box, Grid, Typography } from '@mui/material'

const stylesMap = {
  '1': {
    top: '3px',
    left: '16px',
    padding: '4px 4px 4px 14px',
    position: 'absolute',
  },
  '2': {
    top: '40px',
    left: '-4px',
    padding: '4px 4px 4px 14px',
    position: 'absolute',
  },
  '3': {
    top: '80px',
    left: '16px',
    padding: '4px 4px 4px 14px',
    position: 'absolute',
  },
  '4': {
    top: '80px',
    left: '73px',
    padding: '4px 4px 4px 14px',
    position: 'absolute',
  },
  '5': {
    top: '40px',
    left: '91px',
    padding: '4px 4px 4px 14px',
    position: 'absolute',
  },
  '6': {
    top: '3px',
    left: '72px',
    padding: '4px 4px 4px 14px',
    position: 'absolute',
  },
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
    <Box>
      <Grid
        spacing={1}
        sx={{
          position: 'relative',
        }}
      >
        <Box
          flexShrink={1}
          component={NextImage ? NextImage : 'img'}
          src={characterAsset(characterKey, 'iconGacha')}
          sx={{ maxWidth: '70%' }}
          position="absolute"
          zIndex={0}
          left="-83px"
        />

        <Discs discs={getCharacterDiscs} />
      </Grid>
    </Box>
  )
}
function Discs({ discs }: { discs: ICachedDisc[] }) {
  const mappedDiscs: Array<[any, ICachedDisc | undefined]> =
    allDiscSlotKeys.map((k) => {
      const sxStyles = stylesMap[k] || {}

      return [
        { key: k, sxStyles },
        discs.find((disc: ICachedDisc) => disc.slotKey === k),
      ]
    })
  return (
    <Grid
      xs={1}
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
      {mappedDiscs.map(([key, disc]: [any, ICachedDisc | undefined]) => (
        <Grid item key={key.key} xs={1} sx={key.sxStyles}>
          {disc && (
            <CardThemed
              sx={{
                background: 'none',
              }}
            >
              <Box>
                <Box
                  component={NextImage ? NextImage : 'img'}
                  src={discDefIcon(disc?.setKey)}
                  maxWidth="100%"
                  maxHeight="100%"
                />
                <Typography
                  sx={{
                    position: 'absolute',
                    fontSize: '0.45rem',
                    lineHeight: 1,
                    p: 0.25,
                    bottom: 8,
                    right: 13,
                    zIndex: 10,
                  }}
                >
                  <strong>+{disc.level}</strong>
                </Typography>
              </Box>

              <Box
                component={NextImage ? NextImage : 'img'}
                display="flex"
                position="absolute"
                src={`${commonDefImages('discBackdrop')}`}
                width="41px"
                height="36px"
                top="2px"
                left="6px"
              />
            </CardThemed>
          )}
        </Grid>
      ))}
    </Grid>
  )
}
