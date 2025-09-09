import {
  ImgIcon,
  NextImage,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import { charCard } from '@genshin-optimizer/gi/char-cards'
import type { AscensionKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  useCharMeta,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import {
  type TalentSheetElementKey,
  getCharSheet,
} from '@genshin-optimizer/gi/sheets'
import { splash } from '@genshin-optimizer/gi/silly-wisher'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import { getCharLevelString } from '@genshin-optimizer/gi/util'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import {
  Badge,
  Box,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { grey, yellow } from '@mui/material/colors'
import type { StaticImageData } from 'next/image'
import { useContext } from 'react'
import { DataContext, SillyContext } from '../../context'
import { CharacterName } from './Trans'

export function CharacterCompactTalent() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const { data } = useContext(DataContext)
  const tlvl = {
    auto: data.get(input.total.auto).value,
    skill: data.get(input.total.skill).value,
    burst: data.get(input.total.burst).value,
  }
  const tBoost = {
    auto: data.get(input.total.autoBoost).value,
    skill: data.get(input.total.skillBoost).value,
    burst: data.get(input.total.burstBoost).value,
  }
  return (
    <Box>
      <Grid container spacing={1}>
        {(['auto', 'skill', 'burst'] as const).map((tKey) => {
          const badgeContent = tlvl[tKey].toString()
          return (
            <Grid item xs={4} key={tKey}>
              <Badge
                badgeContent={badgeContent}
                color={tBoost[tKey] ? 'info' : 'secondary'}
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  '& > .MuiBadge-badge': {
                    fontSize: '1em',
                    padding: badgeContent.length > 1 ? '.25em' : '.25em .4em',
                    borderRadius: '.5em',
                    lineHeight: 1,
                    height: '1.25em',
                    right: '25%',
                  },
                }}
              >
                <Box
                  component={NextImage ? NextImage : 'img'}
                  src={characterSheet.getTalentOfKey(tKey)?.img}
                  width="100%"
                  height="auto"
                />
              </Badge>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
export function CharacterCompactConstSelector({
  setConstellation,
  warning = false,
}: {
  setConstellation: (constellation: number) => void
  warning?: boolean
}) {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const constellation = data.get(input.constellation).value
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  return (
    <Grid container spacing={1}>
      {range(1, 6).map((i) => (
        <Grid item xs={4} key={i}>
          <CardActionArea
            onClick={() => setConstellation(i === constellation ? i - 1 : i)}
            style={{
              border: `1px solid ${warning ? yellow[200] : grey[200]}`,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <Box
              component={NextImage ? NextImage : 'img'}
              src={
                characterSheet.getTalentOfKey(
                  `constellation${i}` as TalentSheetElementKey
                )?.img
              }
              sx={{
                ...(constellation >= i ? {} : { filter: 'brightness(50%)' }),
              }}
              width="100%"
              height="auto"
            />
          </CardActionArea>
        </Grid>
      ))}
    </Grid>
  )
}

export function CharacterCoverArea() {
  const { silly } = useContext(SillyContext)
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const { data } = useContext(DataContext)
  const level = data.get(input.lvl).value
  const ascension = data.get(input.asc).value as AscensionKey
  const sillySplash = splash(characterKey, gender)
  const card = charCard(characterKey, gender)

  return silly && sillySplash ? (
    <SillyCoverArea src={sillySplash} level={level} ascension={ascension} />
  ) : (
    <CoverArea src={card} level={level} ascension={ascension} />
  )
}
function SillyCoverArea({
  src,
  level,
  ascension,
}: {
  src: string | StaticImageData
  level: number
  ascension: AscensionKey
}) {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      <Box
        src={src}
        component={NextImage ? NextImage : 'img'}
        width="100%"
        height="auto"
      />
      <Box sx={{ width: '100%', height: '100%' }}>
        <Box
          sx={{
            opacity: 0.85,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            px: 1,
          }}
        >
          <CharChip />
        </Box>
        <Typography
          variant="h6"
          sx={{
            width: '100%',
            opacity: 0.75,
            textAlign: 'center',
          }}
        >
          <StarsDisplay stars={getCharStat(characterKey).rarity} colored />
        </Typography>
        <FavoriteButton />
        <LevelBadge level={level} ascension={ascension} />
      </Box>
    </Box>
  )
}

function CoverArea({
  src,
  level,
  ascension,
}: {
  src: string | StaticImageData
  level: number
  ascension: AscensionKey
}) {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)

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
            opacity: 0.75,
            textAlign: 'center',
          }}
        >
          <StarsDisplay stars={getCharStat(characterKey).rarity} colored />
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
        <FavoriteButton />
        <LevelBadge level={level} ascension={ascension} />
      </Box>
      <Box
        src={src}
        component={NextImage ? NextImage : 'img'}
        width="100%"
        height="auto"
      ></Box>
    </Box>
  )
}

function CharChip() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const charEle = getCharEle(characterKey)
  const weaponType = getCharStat(characterKey).weaponType
  return (
    <Chip
      color={charEle}
      sx={{ height: 'auto' }}
      label={
        <Typography
          variant="h6"
          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
        >
          <ElementIcon ele={charEle} />
          <Box sx={{ whiteSpace: 'normal', textAlign: 'center' }}>
            <CharacterName characterKey={characterKey} gender={gender} />
          </Box>
          <ImgIcon src={imgAssets.weaponTypes[weaponType]} />
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
      <SqBadge>{getCharLevelString(level, ascension)}</SqBadge>
    </Typography>
  )
}
function FavoriteButton() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const { favorite } = useCharMeta(characterKey)
  return (
    <Box sx={{ position: 'absolute', left: 0, top: 0 }}>
      <IconButton
        sx={{ p: 1 }}
        color="error"
        onClick={() =>
          database.charMeta.set(characterKey, { favorite: !favorite })
        }
      >
        {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Box>
  )
}
