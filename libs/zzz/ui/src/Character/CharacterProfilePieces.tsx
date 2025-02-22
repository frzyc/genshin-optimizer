import { ImgIcon, NextImage, SqBadge } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, MilestoneKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { getLevelString } from '@genshin-optimizer/zzz/util'
import { Box, CardActionArea, Chip, Grid, Typography } from '@mui/material'
import { grey, yellow } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'
import { CharacterName } from './CharacterTrans'

export function CharacterCompactMindscapeSelector({
  mindscape,
  setMindscape,
}: {
  mindscape: number
  setMindscape: (mindscape: number) => void
}) {
  const { t } = useTranslation('page_characters')
  return (
    <Grid container spacing={1}>
      {range(1, 6).map((i) => (
        <Grid item xs={4} key={i}>
          <CardActionArea
            onClick={() => setMindscape(i === mindscape ? i - 1 : i)}
            style={{
              border: `1px solid ${mindscape >= i ? yellow[700] : grey[200]}`,
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

export function CharacterCoverArea({
  character: { level, promotion, key: characterKey },
}: {
  character: ICachedCharacter
}) {
  return (
    <CoverArea
      level={level}
      promotion={promotion}
      characterKey={characterKey}
    />
  )
}

function CoverArea({
  characterKey,
  level,
  promotion,
}: {
  characterKey: CharacterKey
  level: number
  promotion: MilestoneKey
}) {
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
          <CharChip characterKey={characterKey} />
        </Box>
        <LevelBadge level={level} promotion={promotion} />
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

function CharChip({ characterKey }: { characterKey: CharacterKey }) {
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
            <CharacterName characterKey={characterKey} />
          </Box>
          <ImgIcon size={1.5} src={specialityDefIcon(specialty)} />
        </Typography>
      }
    />
  )
}
function LevelBadge({
  level,
  promotion,
}: {
  level: number
  promotion: MilestoneKey
}) {
  return (
    <Typography
      sx={{ p: 1, position: 'absolute', right: 0, top: 0, opacity: 0.8 }}
    >
      <SqBadge>{getLevelString(level, promotion)}</SqBadge>
    </Typography>
  )
}
