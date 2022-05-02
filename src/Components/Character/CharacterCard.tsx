import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Box, CardActionArea, CardContent, Chip, Grid, IconButton, Skeleton, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo } from 'react';
import { ascensionMaxLevel } from '../../Data/LevelData';
import { DatabaseContext } from '../../Database/Database';
import { DataContext, dataContextObj, TeamData } from '../../DataContext';
import { uiInput as input } from '../../Formula';
import KeyMap from '../../KeyMap';
import CharacterCardPico from './CharacterCardPico';
import useCharacterReducer from '../../ReactHooks/useCharacterReducer';
import useTeamData from '../../ReactHooks/useTeamData';
import { ICachedArtifact } from '../../Types/artifact';
import { allSlotKeys, CharacterKey, ElementKey, SlotKey } from '../../Types/consts';
import { range } from '../../Util/Util';
import ArtifactCardPico from '../Artifact/ArtifactCardPico';
import CardLight from '../Card/CardLight';
import ConditionalWrapper from '../ConditionalWrapper';
import { NodeFieldDisplay } from '../FieldDisplay';
import SqBadge from '../SqBadge';
import { Stars } from '../StarDisplay';
import StatIcon from '../StatIcon';
import WeaponCardPico from '../Weapon/WeaponCardPico';
import WeaponFullCard from '../Weapon/WeaponFullCard';

type CharacterCardProps = {
  characterKey: CharacterKey | "",
  onClick?: (characterKey: CharacterKey, tab: string) => void,
  onClickHeader?: (characterKey: CharacterKey, tab: string) => void,
  artifactChildren?: Displayable,
  weaponChildren?: Displayable,
  characterChildren?: Displayable,
  footer?: Displayable,
  isTeammateCard?: boolean,
}
export default function CharacterCard({ characterKey, artifactChildren, weaponChildren, characterChildren, onClick, onClickHeader, footer, isTeammateCard }: CharacterCardProps) {
  const { teamData: teamDataContext } = useContext(DataContext)
  const teamData = useTeamData(teamDataContext ? "" : characterKey) ?? (teamDataContext as TeamData | undefined)
  const { character, characterSheet, target: data } = teamData?.[characterKey] ?? {}
  const onClickHandler = useCallback(() => characterKey && onClick?.(characterKey, "overview"), [characterKey, onClick])
  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={onClickHandler} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</CardActionArea>,
    [onClickHandler],
  )
  const characterDispatch = useCharacterReducer(characterKey)
  if (!teamData || !character || !characterSheet || !data) return null;
  const dataContextObj: dataContextObj = {
    character,
    data,
    characterSheet,
    mainStatAssumptionLevel: 0,
    teamData,
    characterDispatch
  }

  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 350 }} />}>
    <DataContext.Provider value={dataContextObj}>
      <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", position: "absolute", zIndex: 2, opacity: 0.7 }}>
          <IconButton sx={{ p: 0.5 }} onClick={event => characterDispatch({ favorite: !character.favorite })}>
            {character.favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc} >
          <Header onClick={!onClick ? onClickHeader : undefined} />
          <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
            <Artifacts />
            {!isTeammateCard && <Grid container columns={4} spacing={0.75}>
              <Grid item xs={1} height="100%">
                <WeaponCardPico weaponId={character.equippedWeapon} />
              </Grid>
              {range(0, 2).map(i => <Grid key={i} item xs={1} height="100%"><CharacterCardPico characterKey={character.team[i]} index={i} /></Grid>)}
            </Grid>}
            {isTeammateCard && <WeaponFullCard weaponId={character.equippedWeapon} />}
            {!isTeammateCard && <Stats />}
            {weaponChildren}
            {artifactChildren}
            {characterChildren}
          </CardContent>
        </ConditionalWrapper>
        {footer}
      </CardLight>
    </DataContext.Provider>
  </Suspense>
}
function Header({ onClick }: { onClick?: (characterKey: CharacterKey, tab: string) => void }) {
  const { data, characterSheet } = useContext(DataContext)
  const characterKey = data.get(input.charKey).value as CharacterKey
  const characterEle = data.get(input.charEle).value as ElementKey
  const characterLevel = data.get(input.lvl).value
  const constellation = data.get(input.constellation).value
  const ascension = data.get(input.asc).value
  const autoBoost = data.get(input.bonus.auto).value
  const skillBoost = data.get(input.bonus.skill).value
  const burstBoost = data.get(input.bonus.burst).value

  const tAuto = data.get(input.total.auto).value
  const tSkill = data.get(input.total.skill).value
  const tBurst = data.get(input.total.burst).value

  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={() => characterKey && onClick?.(characterKey, "overview")} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</CardActionArea>,
    [onClick, characterKey],
  )
  return <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc} >
    <Box display="flex"
      position="relative"
      className={`grad-${characterSheet.rarity}star`}
      sx={{
        "&::before": {
          content: '""',
          display: "block", position: "absolute",
          left: 0, top: 0,
          width: "100%", height: "100%",
          opacity: 0.7,
          backgroundImage: `url(${characterSheet.bannerImg})`, backgroundPosition: "center", backgroundSize: "cover",
        }
      }}
      width="100%" >
      <Box flexShrink={1} sx={{ maxWidth: { xs: "40%", lg: "40%" } }} alignSelf="flex-end" display="flex" flexDirection="column" zIndex={1}>
        <Box
          component="img"
          src={characterSheet.thumbImg}
          width="100%"
          height="auto"
          maxWidth={256}
          sx={{ mt: "auto" }}
        />
      </Box>
      <Box flexGrow={1} sx={{ py: 1, pr: 1 }} display="flex" flexDirection="column" zIndex={1}>
        <Chip label={<Typography variant="subtitle1">{characterSheet.name}</Typography>} size="small" color={characterEle} sx={{ opacity: 0.85 }} />
        <Grid container spacing={1} flexWrap="nowrap">
          <Grid item sx={{ textShadow: "0 0 5px gray" }}>
            <Typography component="span" variant="h6" whiteSpace="nowrap" >Lv. {characterLevel}</Typography>
            <Typography component="span" variant="h6" color="text.secondary">/{ascensionMaxLevel[ascension]}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="h6"><SqBadge>C{constellation}</SqBadge></Typography>
          </Grid>
        </Grid>
        <Grid container spacing={1} flexWrap="nowrap">
          <Grid item>
            <Chip color={autoBoost ? "info" : "secondary"} label={<strong >{tAuto}</strong>} />
          </Grid>
          <Grid item>
            <Chip color={skillBoost ? "info" : "secondary"} label={<strong >{tSkill}</strong>} />
          </Grid>
          <Grid item>
            <Chip color={burstBoost ? "info" : "secondary"} label={<strong >{tBurst}</strong>} />
          </Grid>
        </Grid>
        <Typography mt={1} ><Stars stars={characterSheet.rarity} colored /></Typography>
      </Box>
    </Box>
  </ConditionalWrapper>
}
function Artifacts() {
  const { database } = useContext(DatabaseContext)
  const { data } = useContext(DataContext)
  const artifacts = useMemo(() =>
    allSlotKeys.map(k => [k, database._getArt(data.get(input.art[k].id).value ?? "")]),
    [data, database]) as Array<[SlotKey, ICachedArtifact | undefined]>;

  return <Grid direction="row" container spacing={0.75} columns={5}>
    {artifacts.map(([key, art]: [SlotKey, ICachedArtifact | undefined]) =>
      <Grid item key={key} xs={1}>
        <ArtifactCardPico artifactObj={art} slotKey={key} />
      </Grid>
    )}
  </Grid>
}

function Stats() {
  const { data } = useContext(DataContext)
  return <Box sx={{ width: "100%" }} >
    {Object.values(data.getDisplay().basic).map(n => <NodeFieldDisplay key={n.info.key} node={n} />)}
    {data.get(input.special).info.key && <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} >
      <Typography flexGrow={1}><strong>Specialized:</strong></Typography>
      {StatIcon[data.get(input.special).info.key!]}
      <Typography>{KeyMap.get(data.get(input.special).info.key!)}</Typography>
    </Box>}
  </Box>
}
