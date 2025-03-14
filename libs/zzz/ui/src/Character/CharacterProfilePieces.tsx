import {
  ConditionalWrapper,
  ImgIcon,
  NextImage,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  commonDefIcon,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import {
  allSkillKeys,
  type CharacterKey,
  type MilestoneKey,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { useCharacter } from '@genshin-optimizer/zzz/db-ui'
import type { CharacterData } from '@genshin-optimizer/zzz/dm'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { getLevelString, milestoneMaxLevel } from '@genshin-optimizer/zzz/util'
import { Box, CardActionArea, Chip, Grid, Typography } from '@mui/material'
import { grey, yellow } from '@mui/material/colors'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ZCard } from '../Components'
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
            {t('mindscape', { level: i })}
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
  characterKey,
  onClick,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
}) {
  const { level = 0, promotion = 0 } = useCharacter(characterKey) ?? {}
  const characterStat = getCharStat(characterKey)
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick],
  )
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea
        onClick={onClickHandler}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler],
  )
  return (
    <ZCard>
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '500px' }}>
          <CharImage characterKey={characterKey} character={characterStat} />
          <CharInformation
            characterKey={characterKey}
            characterStat={characterStat}
            promotion={promotion}
            level={level}
          />
        </Box>
      </ConditionalWrapper>
    </ZCard>
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
  characterStat,
  promotion,
  level,
}: {
  characterKey: CharacterKey
  characterStat: CharacterData
  promotion: MilestoneKey
  level: number
}) {
  const { t } = useTranslation('page_characters')
  const { attribute, rarity, specialty } = characterStat
  const character = useCharacter(characterKey)
  const skillStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '-5px',
    left: '-12px',
    width: '1.9em',
    height: '1.9em',
    borderRadius: '20px',
    fontWeight: '500',
    fontSize: '0.9rem',
  }
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
              fontWeight: '900',
            }}
          >
            <CharacterName characterKey={characterKey} />
          </Typography>
          <ElementIcon ele={attribute} />
          <ImgIcon size={2} src={specialityDefIcon(specialty)} />
          <Typography
            variant="h5"
            color="primary"
            sx={{
              fontWeight: '900',
            }}
          >
            {t('mindscape', { level: character ? character.mindscape : 0 })}
          </Typography>
        </Box>
        <Box sx={{ mt: '16px', display: 'flex', gap: 3 }}>
          <Box
            sx={(theme) => ({
              border: `2px solid ${theme.palette.contentZzz.main}`,
              borderRadius: '20px',
              display: 'flex',
            })}
          >
            <Typography
              sx={{ fontWeight: '900', paddingLeft: '12px', fontSize: '16px' }}
            >
              {t('charLevel', { level })}
            </Typography>
            <Typography
              color="primary"
              sx={{
                fontWeight: '900',
                paddingLeft: '4px',
                pr: '10px',
              }}
            >
              / {milestoneMaxLevel[promotion]}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {allSkillKeys.map((item, index) => (
              <Box key={index} sx={{ position: 'relative' }}>
                <ImgIcon size={2} src={commonDefIcon(item)} />
                <Box
                  sx={(theme) => ({
                    ...skillStyles,
                    background: `${theme.palette.background.default}`,
                  })}
                >
                  {character ? character[item] : 0}
                </Box>
              </Box>
            ))}
            <Box sx={{ position: 'relative' }}>
              <ImgIcon size={2} src={commonDefIcon('core')} />
              <Box
                sx={(theme) => ({
                  ...skillStyles,
                  background: `${theme.palette.background.default}`,
                })}
              >
                {character ? character.core : 0}
              </Box>
            </Box>
          </Box>
        </Box>
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
