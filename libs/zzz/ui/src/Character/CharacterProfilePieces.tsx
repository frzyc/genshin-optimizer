import { ImgIcon, NextImage, SqBadge } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  factionDefIcon,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, MilestoneKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import type { CharacterData } from '@genshin-optimizer/zzz/dm'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { getLevelString, milestoneMaxLevel } from '@genshin-optimizer/zzz/util'
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

export function CharacterCoverOptimize({
  character: { level, promotion, key: characterKey },
}: {
  character: ICachedCharacter
}) {
  const character = getCharStat(characterKey)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CharImage characterKey={characterKey} character={character} />
      <CharInformation
        characterKey={characterKey}
        character={character}
        promotion={promotion}
        level={level}
      />
    </Box>
  )
}

function CharImage({
  characterKey,
  character,
}: {
  characterKey: CharacterKey
  character: CharacterData
}) {
  const { attribute, id } = character
  const CHARACTER_IMAGE_URL_BASE =
    'https://act-webstatic.hoyoverse.com/game_record/zzzv2/role_vertical_painting/role_vertical_painting_'

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        background: `${theme.palette[attribute].main}`,
        zIndex: 1,
        overflow: 'hidden',
      })}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '0',
          right: '0',
          display: 'flex',
          transform: 'rotate(10deg) translateX(-50%)',
          zIndex: 2,
        }}
      >
        <ScrollingBackgroundText characterKey={characterKey} />
        <ScrollingBackgroundText characterKey={characterKey} />
      </Box>
      <Box
        src={`${CHARACTER_IMAGE_URL_BASE}${id}.png`}
        component={NextImage ? NextImage : 'img'}
        width="100%"
        height="auto"
        position="relative"
        zIndex="2"
      ></Box>
    </Box>
  )
}
function CharInformation({
  characterKey,
  character,
  promotion,
  level,
}: {
  characterKey: CharacterKey
  character: CharacterData
  promotion: MilestoneKey
  level: number
}) {
  const { attribute, rarity, faction, specialty } = character
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Box
          gap={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ImgIcon size={2} src={rarityDefIcon(rarity)} />
          <Typography
            variant="h5"
            sx={{
              fontStyle: 'italic',
              fontWeight: '900',
              whiteSpace: 'nowrap',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <CharacterName characterKey={characterKey} />
          </Typography>
          <ElementIcon ele={attribute} />
          <ImgIcon size={2} src={specialityDefIcon(specialty)} />
        </Box>
        <Box
          sx={{
            border: '2px #2B364D solid',
            borderRadius: '20px',
            width: '130px',
            display: 'flex',
            marginTop: '16px',
          }}
        >
          <Typography sx={{ fontWeight: '900', paddingLeft: '10px' }}>
            Lv. {level}
          </Typography>
          <Typography
            sx={{ fontWeight: '900', color: '#1E78C8', paddingLeft: '14px' }}
          >
            / {milestoneMaxLevel[promotion]}
          </Typography>
        </Box>
      </Box>
      <Box>
        <ImgIcon size={5} src={factionDefIcon(faction)}></ImgIcon>
      </Box>
    </Box>
  )
}

function ScrollingBackgroundText({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { t } = useTranslation('charNames_gen')
  const scroll = {
    animation: 'scroll 16s infinite linear',
    '@keyframes scroll': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' },
    },
  } as React.CSSProperties

  return (
    <Box
      component={'span'}
      sx={{
        color: '#000',
        marginTop: '20px',
        fontStyle: 'italic',
        fontSize: '280px',
        lineHeight: '223px',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Impact',
        opacity: 0.1,
        ...scroll,
      }}
    >
      {t(`${characterKey}`)}
    </Box>
  )
}
