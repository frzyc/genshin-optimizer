import { ImgIcon, NextImage, SqBadge } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { AscensionKey } from '@genshin-optimizer/zzz/consts'
import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { getLevelString } from '@genshin-optimizer/zzz/util'
import { Box, CardActionArea, Chip, Grid, Typography } from '@mui/material'
import { grey, yellow } from '@mui/material/colors'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterCompactMindscapeSelector({
  setMindscape,
}: {
  setMindscape: (mindscape: number) => void
}) {
  const { t } = useTranslation('page_characters')
  const { character } = useContext(CharacterContext)
  const selectedMindscape = character.mindscape
  return (
    <Grid container spacing={1}>
      {range(1, 6).map((i) => (
        <Grid item xs={4} key={i}>
          <CardActionArea
            onClick={() => setMindscape(i === selectedMindscape ? i - 1 : i)}
            style={{
              border: `1px solid ${
                selectedMindscape >= i ? yellow[700] : grey[200]
              }`,
              borderRadius: '4px',
              overflow: 'hidden',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            {t('characterEditor.mindscape', { level: i })}
          </CardActionArea>
        </Grid>
      ))}
    </Grid>
  )
}

export function CharacterCoverArea() {
  const { character } = useContext(CharacterContext)
  const level = character.level
  const ascension = character.ascension

  return <CoverArea level={level} ascension={ascension} />
}

function CoverArea({
  level,
  ascension,
}: {
  level: number
  ascension: AscensionKey
}) {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { rarity } = getCharStat(characterKey)

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            width: '100%',
            left: '50%',
            bottom: 0,
            transform: 'translate(-50%, -50%)',
            opacity: 1,
            textAlign: 'center',
          }}
        >
          {<ImgIcon size={1.5} src={rarityDefIcon(rarity)} />}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: '7%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.85,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            px: 1,
          }}
        >
          <CharChip />
        </Box>
        <LevelBadge level={level} ascension={ascension} />
      </Box>
      <Box
        src={characterAsset(characterKey, 'full')}
        component={NextImage ? NextImage : 'img'}
        width="100%"
        height="auto"
      ></Box>
    </Box>
  )
}

function CharChip() {
  const { t } = useTranslation('charNames_gen')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { attribute, specialty } = getCharStat(characterKey)
  return (
    <Chip
      color={attribute}
      sx={{ height: 'auto' }}
      label={
        <Typography
          variant="h6"
          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
        >
          <ElementIcon ele={attribute} />
          <Box sx={{ whiteSpace: 'normal', textAlign: 'center' }}>
            {t(`${characterKey}`)}
          </Box>
          <ImgIcon size={1.5} src={specialityDefIcon(specialty)} />
        </Typography>
      }
    />
  )
}
function LevelBadge({
  level,
  ascension,
}: {
  level: number
  ascension: AscensionKey
}) {
  return (
    <Typography
      sx={{ p: 1, position: 'absolute', right: 0, top: 0, opacity: 0.8 }}
    >
      <SqBadge>{getLevelString(level, ascension)}</SqBadge>
    </Typography>
  )
}
