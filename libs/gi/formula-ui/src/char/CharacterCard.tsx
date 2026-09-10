import {
  CardThemed,
  ConditionalWrapper,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import {
  allArtifactSlotKeys,
  type CharacterKey,
  getCharMaxLevel,
} from '@genshin-optimizer/gi/consts'
import {
  useArtifacts,
  useCharacter,
  useCharMeta,
  useDatabase,
  useDBMeta,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import {
  ArtifactCardPico,
  CharacterCardHeader,
  CharacterName,
  type RollColorKey,
  WeaponCardPico,
} from '@genshin-optimizer/gi/ui'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import {
  Box,
  CardActionArea,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useMemo } from 'react'
import { pandoCardSx } from '../pandoCardSx'

export function CharacterCard({
  characterKey,
  onClick,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
}) {
  const database = useDatabase()
  const character = useCharacter(characterKey)
  const { favorite } = useCharMeta(characterKey)
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick]
  )
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea onClick={onClickHandler} sx={{ height: 'auto' }}>
        {children}
      </CardActionArea>
    ),
    [onClickHandler]
  )

  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={180} />}
    >
      <CardThemed
        bgt="light"
        sx={{
          position: 'relative',
          width: '100%',
          ...pandoCardSx,
          ':hover': {
            borderColor: 'rgba(200,200,200,0.8)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            zIndex: 2,
            opacity: 0.7,
          }}
        >
          <IconButton
            sx={{ p: 0.5 }}
            onClick={() =>
              database.charMeta.set(characterKey, { favorite: !favorite })
            }
          >
            {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character ? (
            <>
              <CharacterCardHeader characterKey={characterKey}>
                <CharacterCardHeaderContent characterKey={characterKey} />
              </CharacterCardHeader>
              <Box sx={{ p: 1, width: '100%' }}>
                <CharacterCardEquipmentRow characterKey={characterKey} />
              </Box>
            </>
          ) : (
            <Skeleton variant="rectangular" width="100%" height={300} />
          )}
        </ConditionalWrapper>
      </CardThemed>
    </Suspense>
  )
}

export function CharacterCardHeaderContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { gender } = useDBMeta()
  const character = useCharacter(characterKey)
  const charStat = getCharStat(characterKey)
  const characterEle = getCharEle(characterKey)
  if (!character) return null
  const { level, ascension, constellation, talent } = character

  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">
            <CharacterName characterKey={characterKey} gender={gender} />
          </Typography>
        }
        size="small"
        color={characterEle}
        sx={{ opacity: 0.85 }}
      />
      <Box
        display="flex"
        gap={1}
        sx={{ textShadow: '0 0 5px gray' }}
        alignItems="center"
      >
        <Box>
          <Typography component="span" variant="h6" whiteSpace="nowrap">
            Lv. {level}
          </Typography>
          <Typography component="span" variant="h6" color="text.secondary">
            /{getCharMaxLevel(level, ascension)}
          </Typography>
        </Box>
        <Typography component="span" whiteSpace="nowrap" sx={{ opacity: 0.85 }}>
          <SqBadge
            color={
              `roll${constellation < 3 ? 3 : constellation}` as RollColorKey
            }
            sx={{ color: '#FFF' }}
          >
            <strong>C{constellation}</strong>
          </SqBadge>
        </Typography>
      </Box>
      <Box display="flex" gap={1} sx={{ opacity: 0.85 }}>
        <Chip
          size="small"
          color="secondary"
          label={<strong>{talent.auto}</strong>}
        />
        <Chip
          size="small"
          color="secondary"
          label={<strong>{talent.skill}</strong>}
        />
        <Chip
          size="small"
          color="secondary"
          label={<strong>{talent.burst}</strong>}
        />
      </Box>
      <Typography variant="h6" lineHeight={1}>
        <StarsDisplay stars={charStat.rarity} colored inline />
      </Typography>
    </>
  )
}

function CharacterCardEquipmentRow({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const character = useCharacter(characterKey)
  const arts = useArtifacts(character?.equippedArtifacts)
  const artifacts = useMemo(
    () =>
      allArtifactSlotKeys.map((slotKey) => [slotKey, arts[slotKey]] as const),
    [arts]
  )
  if (!character) return null
  return (
    <Box>
      <Grid container columns={6} spacing={0.5}>
        <Grid item xs={1} height="100%">
          <WeaponCardPico weaponId={character.equippedWeapon} />
        </Grid>
        {artifacts.map(([slotKey, art]) => (
          <Grid item key={slotKey} xs={1}>
            <ArtifactCardPico artifactObj={art} slotKey={slotKey} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
