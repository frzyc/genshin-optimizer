import {
  ConditionalWrapper,
  ImgIcon,
  NextImage,
} from '@genshin-optimizer/common/ui'
import {
  commonDefIcon,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import {
  allSkillKeys,
  type CharacterKey,
  type MilestoneKey,
} from '@genshin-optimizer/zzz/consts'
import { useCharacter } from '@genshin-optimizer/zzz/db-ui'
import type { CharacterData } from '@genshin-optimizer/zzz/dm'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { milestoneMaxLevel } from '@genshin-optimizer/zzz/util'
import { Badge, CardActionArea, Typography } from '@mui/material'
import type { Variant } from '@mui/material/styles/createTypography'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ZCard } from '../Components'
import { CharacterName } from './CharacterTrans'

export type CharCardConfigProps = {
  cardWidth: string
  charImgWidth: string
  iconsSize: number
  isEditing: boolean
  charNameWidth: string //166px //290
  charNameVariant: Variant
  scrollingBgSize: string
}

export function CharacterCard({
  characterKey,
  onClick,
  charCardConfig,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  charCardConfig?: CharCardConfigProps
}) {
  const { level = 0, promotion = 0 } = useCharacter(characterKey) ?? {}
  const characterStat = getCharStat(characterKey)
  const config: CharCardConfigProps = charCardConfig
    ? charCardConfig
    : {
        cardWidth: '100%',
        charImgWidth: '100%',
        iconsSize: 1.7,
        isEditing: false,
        charNameWidth: '191px',
        charNameVariant: 'h6' as Variant,
        scrollingBgSize: '200px',
      }
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick]
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
    [onClickHandler]
  )

  return (
    <ZCard>
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: config.cardWidth,
          }}
        >
          <CharImage
            characterKey={characterKey}
            characterStat={characterStat}
            charCardConfig={config}
          />
          <CharInformation
            characterKey={characterKey}
            characterStat={characterStat}
            promotion={promotion}
            level={level}
            charCardConfig={config}
          />
        </Box>
      </ConditionalWrapper>
    </ZCard>
  )
}

function CharImage({
  characterKey,
  characterStat,
  charCardConfig,
}: {
  characterKey: CharacterKey
  characterStat: CharacterData
  charCardConfig: CharCardConfigProps
}) {
  const { attribute, id } = characterStat
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
          transform: 'rotate(5deg) translateX(-50%)',
          zIndex: 2,
        }}
      >
        <ScrollingBackgroundText
          characterKey={characterKey}
          charCardConfig={charCardConfig}
        />
        <ScrollingBackgroundText
          characterKey={characterKey}
          charCardConfig={charCardConfig}
        />
      </Box>
      <Box
        src={`${CHARACTER_IMAGE_URL_BASE}${id}.png`}
        component={NextImage ? NextImage : 'img'}
        width={charCardConfig.charImgWidth}
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
  charCardConfig,
}: {
  characterKey: CharacterKey
  characterStat: CharacterData
  promotion: MilestoneKey
  level: number
  charCardConfig: CharCardConfigProps
}) {
  const { t } = useTranslation('page_characters')
  const { attribute, rarity, specialty } = characterStat
  const character = useCharacter(characterKey)
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          gap={1}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ImgIcon
            size={charCardConfig.iconsSize}
            src={rarityDefIcon(rarity)}
          />
          <Typography
            variant={charCardConfig.charNameVariant}
            sx={{
              fontWeight: '900',
              maxWidth: charCardConfig.charNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <CharacterName characterKey={characterKey} />
          </Typography>
          <ElementIcon
            ele={attribute}
            iconProps={{
              sx: {
                fontSize: `${charCardConfig.iconsSize}em`,
              },
            }}
          />
          <ImgIcon
            size={charCardConfig.iconsSize}
            src={specialityDefIcon(specialty)}
          />
          {!charCardConfig.isEditing ? (
            <Typography
              variant="h5"
              color="primary"
              sx={{
                fontWeight: '900',
              }}
            >
              {t('mindscape', { level: character ? character.mindscape : 0 })}
            </Typography>
          ) : (
            ''
          )}
        </Box>
        {!charCardConfig.isEditing ? (
          <Box
            sx={{ mt: '12px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}
          >
            <Box
              sx={(theme) => ({
                border: `2px solid ${theme.palette['contentZzz'].main}`,
                borderRadius: '20px',
                display: 'flex',
              })}
            >
              <Typography
                sx={{
                  fontWeight: '900',
                  paddingLeft: '12px',
                  fontSize: '16px',
                }}
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
            <Box
              gap={1.5}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {allSkillKeys.map((item, index) => (
                <Badge
                  key={index}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  badgeContent={`${character ? character[item] : 0}`}
                  color="primary"
                >
                  <ImgIcon size={1.9} src={commonDefIcon(item)} />
                </Badge>
              ))}
              <Badge
                key={6}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                badgeContent={`${character ? character['core'] : 0}`}
                color="primary"
              >
                <ImgIcon size={1.9} src={commonDefIcon('core')} />
              </Badge>
            </Box>
          </Box>
        ) : (
          ''
        )}
      </Box>
    </Box>
  )
}

function ScrollingBackgroundText({
  characterKey,
  charCardConfig,
}: {
  characterKey: CharacterKey
  charCardConfig: CharCardConfigProps
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
        fontSize: charCardConfig.scrollingBgSize,
        lineHeight: '150px',
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
