import type {
  ArtifactSlotKey,
  CharacterKey,
  ElementKey,
} from '@genshin-optimizer/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import { characterAsset } from '@genshin-optimizer/g-assets'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import {
  Box,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import type { CharacterContextObj } from '../../Context/CharacterContext'
import { CharacterContext } from '../../Context/CharacterContext'
import type { dataContextObj } from '../../Context/DataContext'
import { DataContext } from '../../Context/DataContext'
import { SillyContext } from '../../Context/SillyContext'
import { getCharSheet } from '../../Data/Characters'
import { ascensionMaxLevel } from '../../Data/LevelData'
import { DatabaseContext } from '../../Database/Database'
import { uiInput as input } from '../../Formula'
import useCharacter from '../../ReactHooks/useCharacter'
import useCharacterReducer from '../../ReactHooks/useCharacterReducer'
import useCharMeta from '../../ReactHooks/useCharMeta'
import useDBMeta from '../../ReactHooks/useDBMeta'
import useTeamData from '../../ReactHooks/useTeamData'
import type { ICachedArtifact } from '../../Types/artifact'
import type { ICachedCharacter } from '../../Types/character'
import { iconAsset } from '../../Util/AssetUtil'
import { range } from '../../Util/Util'
import ArtifactCardPico from '../Artifact/ArtifactCardPico'
import CardLight from '../Card/CardLight'
import ConditionalWrapper from '../ConditionalWrapper'
import { NodeFieldDisplay } from '../FieldDisplay'
import SqBadge from '../SqBadge'
import { StarsDisplay } from '../StarDisplay'
import WeaponCardPico from '../Weapon/WeaponCardPico'
import WeaponFullCard from '../Weapon/WeaponFullCard'
import CharacterCardPico, { BlankCharacterCardPico } from './CharacterCardPico'

type CharacterCardProps = {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onClickHeader?: (characterKey: CharacterKey) => void
  onClickTeammate?: (characterKey: CharacterKey) => void
  artifactChildren?: Displayable
  weaponChildren?: Displayable
  characterChildren?: Displayable
  footer?: Displayable
  hideStats?: boolean
  isTeammateCard?: boolean
}
export default function CharacterCard({
  characterKey,
  artifactChildren,
  weaponChildren,
  characterChildren,
  onClick,
  onClickHeader,
  onClickTeammate,
  footer,
  hideStats,
  isTeammateCard,
}: CharacterCardProps) {
  const { database } = useContext(DatabaseContext)
  const teamData = useTeamData(characterKey)
  const character = useCharacter(characterKey)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const characterDispatch = useCharacterReducer(characterKey)
  const data = teamData?.[characterKey]?.target
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick]
  )
  const actionWrapperFunc = useCallback(
    (children) => (
      <CardActionArea
        onClick={onClickHandler}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler]
  )

  const characterContextObj: CharacterContextObj | undefined = useMemo(
    () =>
      character &&
      characterSheet && {
        character,
        characterSheet,
        characterDispatch,
      },
    [character, characterSheet, characterDispatch]
  )
  const dataContextObj: dataContextObj | undefined = useMemo(
    () =>
      data &&
      teamData && {
        data,
        teamData,
      },
    [data, teamData]
  )

  const { favorite } = useCharMeta(characterKey)
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          width="100%"
          height={hideStats ? 300 : 600}
        />
      }
    >
      <CardLight
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
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
            onClick={(_) =>
              database.charMeta.set(characterKey, { favorite: !favorite })
            }
          >
            {favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character && dataContextObj && characterContextObj ? (
            <ExistingCharacterCardContent
              characterContextObj={characterContextObj}
              dataContextObj={dataContextObj}
              characterKey={characterKey}
              onClick={onClick}
              onClickHeader={onClickHeader}
              isTeammateCard={isTeammateCard}
              character={character}
              onClickTeammate={onClickTeammate}
              hideStats={hideStats}
              weaponChildren={weaponChildren}
              artifactChildren={artifactChildren}
              characterChildren={characterChildren}
            />
          ) : (
            <NewCharacterCardContent characterKey={characterKey} />
          )}
        </ConditionalWrapper>
        {footer}
      </CardLight>
    </Suspense>
  )
}

type ExistingCharacterCardContentProps = {
  characterContextObj: CharacterContextObj
  dataContextObj: dataContextObj
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onClickHeader?: (characterKey: CharacterKey) => void
  isTeammateCard?: boolean
  character: ICachedCharacter
  onClickTeammate?: (characterKey: CharacterKey) => void
  hideStats?: boolean
  weaponChildren?: Displayable
  artifactChildren?: Displayable
  characterChildren?: Displayable
}
function ExistingCharacterCardContent({
  characterContextObj,
  dataContextObj,
  characterKey,
  onClick,
  onClickHeader,
  isTeammateCard,
  character,
  onClickTeammate,
  hideStats,
  weaponChildren,
  artifactChildren,
  characterChildren,
}: ExistingCharacterCardContentProps) {
  return (
    <CharacterContext.Provider value={characterContextObj}>
      <DataContext.Provider value={dataContextObj}>
        <Header
          characterKey={characterKey}
          onClick={!onClick ? onClickHeader : undefined}
        >
          <HeaderContent />
        </Header>
        <CardContent
          sx={(theme) => ({
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            padding: hideStats ? `${theme.spacing(1)}!important` : undefined,
          })}
        >
          <Artifacts />
          {!isTeammateCard && (
            <Grid container columns={4} spacing={0.75}>
              <Grid item xs={1} height="100%">
                <WeaponCardPico weaponId={character.equippedWeapon} />
              </Grid>
              {range(0, 2).map((i) => (
                <Grid key={i} item xs={1} height="100%">
                  {character.team[i] ? (
                    <CharacterCardPico
                      simpleTooltip={hideStats}
                      characterKey={character.team[i] as CharacterKey}
                      onClick={!onClick ? onClickTeammate : undefined}
                    />
                  ) : (
                    <BlankCharacterCardPico index={i} />
                  )}
                </Grid>
              ))}
            </Grid>
          )}
          {isTeammateCard && (
            <WeaponFullCard weaponId={character.equippedWeapon} />
          )}
          {!isTeammateCard && !hideStats && <Stats />}
          {weaponChildren}
          {artifactChildren}
          {characterChildren}
        </CardContent>
      </DataContext.Provider>
    </CharacterContext.Provider>
  )
}

function NewCharacterCardContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return (
    <>
      <Header characterKey={characterKey}>
        <HeaderContentNew characterKey={characterKey} />
      </Header>
      <CardContent
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          height: '100%',
        }}
      ></CardContent>
    </>
  )
}

function Header({
  children,
  characterKey,
  onClick,
}: {
  children: JSX.Element
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
}) {
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const characterSheet = getCharSheet(characterKey, gender)

  const actionWrapperFunc = useCallback(
    (children) => (
      <CardActionArea
        onClick={() => characterKey && onClick?.(characterKey)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClick, characterKey]
  )
  if (!characterSheet) return null
  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <Box
        display="flex"
        position="relative"
        className={`grad-${characterSheet.rarity}star`}
        sx={{
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0.7,
            backgroundImage: `url(${characterAsset(
              characterKey,
              'banner',
              gender
            )})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          },
        }}
        width="100%"
      >
        <Box
          flexShrink={1}
          sx={{ maxWidth: { xs: '40%', lg: '40%' } }}
          alignSelf="flex-end"
          display="flex"
          flexDirection="column"
          zIndex={1}
        >
          <Box
            component="img"
            src={iconAsset(characterKey, gender, silly)}
            width="100%"
            height="auto"
            maxWidth={256}
            sx={{ mt: 'auto' }}
          />
        </Box>
        <Box
          flexGrow={1}
          sx={{ py: 1, pr: 1 }}
          display="flex"
          flexDirection="column"
          zIndex={1}
        >
          {children}
        </Box>
      </Box>
    </ConditionalWrapper>
  )
}

function HeaderContent() {
  const { characterSheet } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const characterEle = data.get(input.charEle).value as ElementKey
  const characterLevel = data.get(input.lvl).value
  const constellation = data.get(input.constellation).value
  const ascension = data.get(input.asc).value
  const autoBoost = data.get(input.total.autoBoost).value
  const skillBoost = data.get(input.total.skillBoost).value
  const burstBoost = data.get(input.total.burstBoost).value

  const tAuto = data.get(input.total.auto).value
  const tSkill = data.get(input.total.skill).value
  const tBurst = data.get(input.total.burst).value

  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">{characterSheet.name}</Typography>
        }
        size="small"
        color={characterEle}
        sx={{ opacity: 0.85 }}
      />
      <Grid container spacing={1} flexWrap="nowrap">
        <Grid item sx={{ textShadow: '0 0 5px gray' }}>
          <Typography component="span" variant="h6" whiteSpace="nowrap">
            Lv. {characterLevel}
          </Typography>
          <Typography component="span" variant="h6" color="text.secondary">
            /{ascensionMaxLevel[ascension]}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">
            <SqBadge>C{constellation}</SqBadge>
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} flexWrap="nowrap">
        <Grid item>
          <Chip
            color={autoBoost ? 'info' : 'secondary'}
            label={<strong>{tAuto}</strong>}
          />
        </Grid>
        <Grid item>
          <Chip
            color={skillBoost ? 'info' : 'secondary'}
            label={<strong>{tSkill}</strong>}
          />
        </Grid>
        <Grid item>
          <Chip
            color={burstBoost ? 'info' : 'secondary'}
            label={<strong>{tBurst}</strong>}
          />
        </Grid>
      </Grid>
      <Typography mt={1}>
        <StarsDisplay stars={characterSheet.rarity} colored />
      </Typography>
    </>
  )
}

function HeaderContentNew({ characterKey }: { characterKey: CharacterKey }) {
  const { gender } = useDBMeta()
  const sheet = getCharSheet(characterKey, gender)

  if (!sheet) return null
  return (
    <>
      <Chip
        label={<Typography variant="subtitle1">{sheet.name}</Typography>}
        size="small"
        color={sheet.elementKey}
        sx={{ opacity: 0.85 }}
      />
      <Box mt={1}>
        <Typography variant="h4">
          <SqBadge>NEW</SqBadge>
        </Typography>
      </Box>
      <Typography mt={1.5}>
        <StarsDisplay stars={sheet.rarity} colored />
      </Typography>
    </>
  )
}

function Artifacts() {
  const { database } = useContext(DatabaseContext)
  const { data } = useContext(DataContext)
  const artifacts = useMemo(
    () =>
      allArtifactSlotKeys.map((k) => [
        k,
        database.arts.get(data.get(input.art[k].id).value ?? ''),
      ]),
    [data, database]
  ) as Array<[ArtifactSlotKey, ICachedArtifact | undefined]>

  return (
    <Grid direction="row" container spacing={0.75} columns={5}>
      {artifacts.map(
        ([key, art]: [ArtifactSlotKey, ICachedArtifact | undefined]) => (
          <Grid item key={key} xs={1}>
            <ArtifactCardPico artifactObj={art} slotKey={key} />
          </Grid>
        )
      )}
    </Grid>
  )
}

function Stats() {
  const { data } = useContext(DataContext)
  return (
    <Box sx={{ width: '100%' }}>
      {Object.values(data.getDisplay().basic).map((n) => (
        <NodeFieldDisplay key={JSON.stringify(n.info)} node={n} />
      ))}
      {data.get(input.special).info.name && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography flexGrow={1}>
            <strong>Specialized:</strong>
          </Typography>
          {data.get(input.special).info.icon}
          <Typography>{data.get(input.special).info.name}</Typography>
        </Box>
      )}
    </Box>
  )
}
