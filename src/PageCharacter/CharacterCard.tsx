import { Box, CardActionArea, CardContent, Chip, Grid, Skeleton, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo } from 'react';
import { SlotIconSVG } from '../Components/Artifact/SlotNameWIthIcon';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import ConditionalWrapper from '../Components/ConditionalWrapper';
import { NodeFieldDisplay } from '../Components/FieldDisplay';
import ImgIcon from '../Components/Image/ImgIcon';
import SqBadge from '../Components/SqBadge';
import { Stars } from '../Components/StarDisplay';
import StatIcon from '../Components/StatIcon';
import { ArtifactSheet } from '../Data/Artifacts/ArtifactSheet';
import { ascensionMaxLevel } from '../Data/LevelData';
import WeaponSheet from '../Data/Weapons/WeaponSheet';
import { DatabaseContext } from '../Database/Database';
import { DataContext, dataContextObj, TeamData } from '../DataContext';
import { uiInput as input } from '../Formula';
import { computeUIData, dataObjForWeapon } from '../Formula/api';
import KeyMap, { cacheValueString, valueString } from '../KeyMap';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import usePromise from '../ReactHooks/usePromise';
import useTeamData from '../ReactHooks/useTeamData';
import { ICachedArtifact } from '../Types/artifact';
import { allSlotKeys, CharacterKey, ElementKey, SlotKey } from '../Types/consts';
import { ICachedWeapon } from '../Types/weapon';
import { NodeDisplay } from '../Formula/uiData'
import { theme } from '../Theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type CharacterCardProps = {
  characterKey: CharacterKey | "",
  onClick?: (characterKey: CharacterKey) => void,
  onClickHeader?: (characterKey: CharacterKey) => void,
  artifactChildren?: Displayable,
  weaponChildren?: Displayable,
  characterChildren?: Displayable,
  footer?: Displayable,
}
export default function CharacterCard({ characterKey, artifactChildren, weaponChildren, characterChildren, onClick, onClickHeader, footer }: CharacterCardProps) {
  const { teamData: teamDataContext } = useContext(DataContext)
  const teamData = useTeamData(teamDataContext ? "" : characterKey) ?? (teamDataContext as TeamData | undefined)
  const { character, characterSheet, target: data } = teamData?.[characterKey] ?? {}
  const onClickHandler = useCallback(() => characterKey && onClick?.(characterKey), [characterKey, onClick])
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
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc} >
          <Header onClick={!onClick ? onClickHeader : undefined} />
          <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, flexGrow: 1, pl: 1, pr: 1 }}>
            <Weapon weaponId={character.equippedWeapon} />
            {weaponChildren}
            {/* will grow to fill the 100% height */}
            <Box flexGrow={1} display="flex" flexDirection="column" gap={0.5}>
              <ArtifactDisplay />
              {artifactChildren}
            </Box>
            <Stats />
            {characterChildren}
          </CardContent>
        </ConditionalWrapper>
        {footer}
      </CardLight>
    </DataContext.Provider>
  </Suspense>
}
function Header({ onClick }: { onClick?: (characterKey: CharacterKey) => void }) {
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
    children => <CardActionArea onClick={() => characterKey && onClick?.(characterKey)} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</CardActionArea>,
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
        <Chip label={<Typography variant="subtitle1">{characterSheet.name}</Typography>} size="small" color={characterEle} />
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
function Weapon({ weaponId }: { weaponId: string }) {
  const { database } = useContext(DatabaseContext)
  const weapon = database._getWeapon(weaponId)
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;
  return <CardDark>
    <Box display="flex" >
      <Box flexShrink={1} maxWidth="35%" display="flex" flexDirection="column" alignContent="flex-end" className={`grad-${weaponSheet.rarity}star`} >
        <Box
          component="img"
          src={weaponSheet.img}
          width="100%"
          height="auto"
          sx={{ mt: "auto" }}
        />
      </Box>
      <Box flexGrow={1} sx={{ p: 1 }}>
        <Typography variant="body2" gutterBottom><strong>{weaponSheet?.name}</strong></Typography>
        <Typography variant='subtitle1' sx={{ display: "flex", gap: 1 }} gutterBottom>
          <SqBadge color="primary">Lv. {WeaponSheet.getLevelString(weapon as ICachedWeapon)}</SqBadge>
          {weaponSheet.hasRefinement && <SqBadge color="info">R{weapon.refinement}</SqBadge>}
        </Typography>
        <Typography variant='subtitle1' sx={{ display: "flex", gap: 1 }} >
          <WeaponStat node={UIData.get(input.weapon.main)} />
          <WeaponStat node={UIData.get(input.weapon.sub)} />
        </Typography>

      </Box>
    </Box>
  </CardDark>
}
function WeaponStat({ node }: { node: NodeDisplay }) {
  if (!node.key) return null
  const val = valueString(node.value, node.unit, !node.unit ? 0 : undefined)
  return <SqBadge color="secondary">{StatIcon[node.key]} {val}</SqBadge>
}
function ArtifactDisplay() {
  const { database } = useContext(DatabaseContext)
  const { data } = useContext(DataContext)
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const artifacts = useMemo(() =>
    allSlotKeys.map(k => [k, database._getArt(data.get(input.art[k].id).value ?? "")]),
    [data, database]) as Array<[SlotKey, ICachedArtifact | undefined]>;
  if (!artifactSheets) return null

  return <Grid container spacing={1}>
    {artifacts.map(([key, art]: [SlotKey, ICachedArtifact | undefined]) => {
      if (!art) return <Grid item key={key} flexGrow={1}>
        <CardDark variant="outlined" sx={{ height: "100%" }}>
          <Box sx={{ pl: 0.4, pr: 0.4, pt: 1, pb: 1, textAlign: "center" }}>
            <FontAwesomeIcon icon={SlotIconSVG[key]} key={key} className="fa-fw" size="3x" />
          </Box>
        </CardDark>
      </Grid>

      const { setKey, slotKey, mainStatKey, rarity, level, mainStatVal } = art
      return <Grid item key={key} flexGrow={1}>
        <CardDark variant="outlined" sx={{ borderColor: theme.palette[`star${rarity}`].main }}>
          <Box sx={{ pl: 0.4, pr: 0.4, pt: 0.25, pb: 1, textAlign: "center" }}>
            <ImgIcon src={artifactSheets?.[setKey].slotIcons[slotKey]} sx={{ height: "3.5em" }} />
            <Typography variant='subtitle1' sx={{ display: "flex", gap: 1, mb: 0.5 }} >
              <SqBadge color="primary">Lv. {level}</SqBadge>
            </Typography>
            <Typography variant='subtitle1' sx={{ display: "flex", gap: 1 }} >
              <BootstrapTooltip placement="top" title={<Typography>{KeyMap.getArtStr(mainStatKey)}</Typography>}>
                  <SqBadge color="secondary">{StatIcon[mainStatKey]} {cacheValueString(mainStatVal, KeyMap.unit(mainStatKey))}{KeyMap.unit(mainStatKey)}</SqBadge>
              </BootstrapTooltip>
            </Typography>
          </Box>
        </CardDark>
      </Grid>
    })}
  </Grid>
}
function Stats() {
  const { data } = useContext(DataContext)
  return <Box sx={{ width: "100%" }} >
    {Object.values(data.getDisplay().basic).map(n => <NodeFieldDisplay key={n.key} node={n} />)}
    {data.get(input.special).key && <Box sx={{ display: "flex", gap: 1, alignItems: "center" }} >
      <Typography flexGrow={1}><strong>Specialized:</strong></Typography>
      {StatIcon[data.get(input.special).key!]}
      <Typography>{KeyMap.get(data.get(input.special).key!)}</Typography>
    </Box>}
  </Box>
}
