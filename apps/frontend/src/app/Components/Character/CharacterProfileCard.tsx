import { imgAssets } from '@genshin-optimizer/gi/assets'
import { charCard } from '@genshin-optimizer/gi/char-cards'
import type { AscensionKey } from '@genshin-optimizer/gi/consts'
import {
  useCharMeta,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { splash } from '@genshin-optimizer/gi/silly-wisher'
import { getLevelString } from '@genshin-optimizer/gi/util'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import {
  Badge,
  Box,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CharacterContext } from '../../Context/CharacterContext'
import { DataContext } from '../../Context/DataContext'
import { SillyContext } from '../../Context/SillyContext'
import type { TalentSheetElementKey } from '../../Data/Characters/ICharacterSheet'
import { uiInput as input } from '../../Formula'
import { ElementIcon } from '../../KeyMap/StatIcon'
import useCharacterReducer from '../../ReactHooks/useCharacterReducer'
import { range } from '../../Util/Util'
import CardLight from '../Card/CardLight'
import ImgIcon from '../Image/ImgIcon'
import SqBadge from '../SqBadge'
import { StarsDisplay } from '../StarDisplay'

/* Image card with star and name and level */
export default function CharacterProfileCard() {
  const { silly } = useContext(SillyContext)
  const {
    characterSheet,
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const { data } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const navigate = useNavigate()
  const level = data.get(input.lvl).value
  const ascension = data.get(input.asc).value as AscensionKey
  const constellation = data.get(input.constellation).value
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
  const sillySplash = splash(characterKey, gender)
  const card = charCard(characterKey, gender)

  return (
    <CardLight sx={{ height: '100%' }}>
      {silly && sillySplash ? (
        <SillyCoverArea src={sillySplash} level={level} ascension={ascension} />
      ) : (
        <CoverArea src={card} level={level} ascension={ascension} />
      )}
      <Box>
        <CardActionArea sx={{ p: 1 }} onClick={() => navigate('talent')}>
          <Grid container spacing={1} mt={-1}>
            {(['auto', 'skill', 'burst'] as TalentSheetElementKey[]).map(
              (tKey) => (
                <Grid item xs={4} key={tKey}>
                  <Badge
                    badgeContent={tlvl[tKey]}
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
                        fontSize: '1.25em',
                        padding: '.25em .4em',
                        borderRadius: '.5em',
                        lineHeight: 1,
                        height: '1.25em',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={characterSheet.getTalentOfKey(tKey)?.img}
                      width="100%"
                      height="auto"
                    />
                  </Badge>
                </Grid>
              )
            )}
          </Grid>
        </CardActionArea>
        <Typography sx={{ textAlign: 'center', mt: 1 }} variant="h6">
          {characterSheet.constellationName}
        </Typography>
        <Grid container spacing={1}>
          {range(1, 6).map((i) => (
            <Grid item xs={4} key={i}>
              <CardActionArea
                onClick={() =>
                  characterDispatch({
                    constellation: i === constellation ? i - 1 : i,
                  })
                }
              >
                <Box
                  component="img"
                  src={
                    characterSheet.getTalentOfKey(
                      `constellation${i}` as TalentSheetElementKey
                    )?.img
                  }
                  sx={{
                    ...(constellation >= i
                      ? {}
                      : { filter: 'brightness(50%)' }),
                  }}
                  width="100%"
                  height="auto"
                />
              </CardActionArea>
            </Grid>
          ))}
        </Grid>
        {/* <CardActionArea sx={{ p: 1 }} onClick={() => navigate('teambuffs')}>
          <Grid container columns={3} spacing={1}>
            {range(0, 2).map((i) => (
              <Grid key={i} item xs={1} height="100%">
                {team[i] ? (
                  <CharacterCardPico characterKey={team[i] as CharacterKey} />
                ) : (
                  <BlankCharacterCardPico index={i} />
                )}
              </Grid>
            ))}
          </Grid>
        </CardActionArea> */}
      </Box>
    </CardLight>
  )
}
function SillyCoverArea({ src, level, ascension }) {
  const { characterSheet } = useContext(CharacterContext)

  return (
    <Box sx={{ position: 'relative' }}>
      <Box src={src} component="img" width="100%" height="auto" />
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
          <StarsDisplay stars={characterSheet.rarity} colored />
        </Typography>
        <FavoriteButton />
        <LevelBadge level={level} ascension={ascension} />
      </Box>
    </Box>
  )
}

function CoverArea({ src, level, ascension }) {
  const { characterSheet } = useContext(CharacterContext)

  return (
    <Box sx={{ position: 'relative' }}>
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
          <StarsDisplay stars={characterSheet.rarity} colored />
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
      <Box src={src} component="img" width="100%" height="auto"></Box>
    </Box>
  )
}

function CharChip() {
  const { characterSheet } = useContext(CharacterContext)
  const charEle = characterSheet.elementKey
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
            {characterSheet.name}
          </Box>
          <ImgIcon
            src={imgAssets.weaponTypes?.[characterSheet.weaponTypeKey]}
          />
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
        {favorite ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
    </Box>
  )
}
