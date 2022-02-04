import { Box, CardActionArea, CardContent, Chip, Grid, Skeleton, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo } from 'react';
import { ArtifactSheet } from '../Data/Artifacts/ArtifactSheet';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import ConditionalWrapper from '../Components/ConditionalWrapper';
import ImgIcon from '../Components/Image/ImgIcon';
import SqBadge from '../Components/SqBadge';
import { Stars } from '../Components/StarDisplay';
import StatIcon from '../Components/StatIcon';
import { ascensionMaxLevel } from '../Data/LevelData';
import { DatabaseContext } from '../Database/Database';
import { DataContext, dataContextObj, TeamData } from '../DataContext';
import { input } from '../Formula';
import { computeUIData, dataObjForWeapon, valueString } from '../Formula/api';
import { NumNode } from '../Formula/type';
import KeyMap from '../KeyMap';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import usePromise from '../ReactHooks/usePromise';
import useTeamData from '../ReactHooks/useTeamData';
import { ICachedArtifact } from '../Types/artifact_WR';
import { allSlotKeys, CharacterKey, ElementKey, SlotKey } from '../Types/consts';
import { ICachedWeapon } from '../Types/weapon_WR';
import WeaponSheet from '../Data/Weapons/WeaponSheet';

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
          <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
            <Weapon weaponId={character.equippedWeapon} />
            {weaponChildren}
            {/* will grow to fill the 100% height */}
            <Box flexGrow={1} display="flex" flexDirection="column" gap={1}>
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
  const autoBoost = data.get(input.bonus.talent.auto).value
  const skillBoost = data.get(input.bonus.talent.skill).value
  const burstBoost = data.get(input.bonus.talent.burst).value

  const tAuto = data.get(input.total.talent.auto).value
  const tSkill = data.get(input.total.talent.skill).value
  const tBurst = data.get(input.total.talent.burst).value

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
            <Chip color={autoBoost ? "info" : "secondary"} label={<strong >{tAuto + 1}</strong>} />
          </Grid>
          <Grid item>
            <Chip color={skillBoost ? "info" : "secondary"} label={<strong >{tSkill + 1}</strong>} />
          </Grid>
          <Grid item>
            <Chip color={burstBoost ? "info" : "secondary"} label={<strong >{tBurst + 1}</strong>} />
          </Grid>
        </Grid>
        <Typography mt={1} ><Stars stars={characterSheet.rarity} colored /></Typography>
      </Box>
    </Box>
  </ConditionalWrapper>
}
function Weapon({ weaponId }: { weaponId: string }) {
  const database = useContext(DatabaseContext)
  const weapon = database._getWeapon(weaponId)
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])
  const UIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  if (!weapon || !weaponSheet || !UIData) return null;
  const name = weaponSheet?.name
  const mainVal = valueString(UIData.get(input.weapon.main).value, UIData.get(input.weapon.main).unit, 0)
  const subKey = UIData.get(input.weapon.sub).key
  const subVal = valueString(UIData.get(input.weapon.sub).value, UIData.get(input.weapon.sub).unit, UIData.get(input.weapon.sub).unit === "flat" ? 0 : undefined)
  const levelName = WeaponSheet.getLevelString(weapon as ICachedWeapon)
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
        <Typography variant="body2"><strong>{name}</strong></Typography>
        <Typography whiteSpace="nowrap" lineHeight={1}>
          <SqBadge color="primary" sx={{ mr: 1 }}>Lv. {levelName}</SqBadge>
          {subKey && <SqBadge color="info"> Refinement {weapon.refinement}</SqBadge>}
        </Typography>
        <Typography variant="subtitle1">ATK: {mainVal}</Typography>
        {subKey && <Typography variant="subtitle2" lineHeight={1}>{KeyMap.get(subKey)}: {subVal}</Typography>}
      </Box>
    </Box>
  </CardDark>
}
function ArtifactDisplay() {
  const database = useContext(DatabaseContext)
  const { data } = useContext(DataContext)
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const artifacts = useMemo(() =>
    allSlotKeys.map(k => [k, database._getArt(data.get(input.art[k].id).value ?? "")]),
    [data, database]) as Array<[SlotKey, ICachedArtifact | undefined]>;
  if (!artifactSheets) return null
  return <Grid container spacing={1} >
    {artifacts.map(([key, art]) => {
      if (!art) return null
      const { setKey, slotKey, mainStatKey } = art
      return <Grid item key={key} flexGrow={1}>
        <Chip color="secondary" sx={{ width: "100%" }} icon={<ImgIcon src={artifactSheets?.[setKey].slotIcons[slotKey]} size={2.5} />}
          label={<span>{KeyMap.get(mainStatKey)}</span>} />
      </Grid>
    })}
  </Grid>
}
function Stats() {
  const { data } = useContext(DataContext)
  const statkeys = ["hp", "atk", "def", "eleMas", "critRate_", "critDMG_", "enerRech_",]
  statkeys.push(`${data.get(input.charEle).value}_dmg_`)
  if (data.get(input.weaponType).value !== "catalyst")
    statkeys.push("physical_dmg_")

  return <Box sx={{ width: "100%" }} >
    {statkeys.map(statKey => {
      const stat = data.get(input.total[statKey] as NumNode)
      const val = valueString(stat.value, stat.unit, stat.unit === "flat" ? 0 : undefined)
      return <Box sx={{ display: "flex" }} key={statKey}>
        <Typography flexGrow={1} color={`${stat.variant}.main`}><strong>{StatIcon[statKey]} {KeyMap.get(stat.key!)}</strong></Typography>
        <Typography>{val}</Typography>
      </Box>
    })}
    {data.get(input.special).key && <Box sx={{ display: "flex" }} >
      <Typography flexGrow={1}><strong>Specialized:</strong></Typography>
      <Typography>{KeyMap.get(data.get(input.special).key!)}</Typography>
    </Box>}
  </Box>
}
