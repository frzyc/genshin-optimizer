import { Box, CardActionArea, CardContent, Chip, Grid, Skeleton, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo } from 'react';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import ConditionalWrapper from '../Components/ConditionalWrapper';
import ImgIcon from '../Components/Image/ImgIcon';
import SqBadge from '../Components/SqBadge';
import { Stars } from '../Components/StarDisplay';
import StatIcon from '../Components/StatIcon';
import { ascensionMaxLevel } from '../Data/LevelData';
import { DatabaseContext } from '../Database/Database';
import useCharacter from '../ReactHooks/useCharacter';
import usePromise from '../ReactHooks/usePromise';
import useSheets, { Sheets } from '../ReactHooks/useSheets';
import Stat from '../Stat';
import { CharacterKey, SlotKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { ICachedWeapon } from '../Types/weapon';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterSheet from './CharacterSheet';

type CharacterCardProps = {
  characterKey: CharacterKey | "",
  onClick?: (characterKey: CharacterKey) => void,
  onClickHeader?: (characterKey: CharacterKey) => void,
  artifactChildren?: Displayable,
  weaponChildren?: Displayable,
  footer?: Displayable,
  build?: ICalculatedStats
}
export default function CharacterCard({ build, characterKey, artifactChildren, weaponChildren, onClick, onClickHeader, footer }: CharacterCardProps) {
  const database = useContext(DatabaseContext)
  const character = useCharacter(characterKey)
  const sheets = useSheets()
  const characterSheet = sheets?.characterSheets[characterKey] as CharacterSheet | undefined
  const stats = useMemo(() => build ?? (character && sheets && Character.calculateBuild(character, database, sheets)), [build, character, sheets, database])
  const onClickHandler = useCallback(() => characterKey && onClick?.(characterKey), [characterKey, onClick])
  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={onClickHandler} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</CardActionArea>,
    [onClickHandler],
  )
  if (!character || !characterSheet || !stats) return null;

  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 350 }} />}>
    <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc} >
        <Header characterSheet={characterSheet} stats={stats} onClick={!onClick ? onClickHeader : undefined} />
        <CardContent sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
          {sheets && <Weapon weaponId={character.equippedWeapon} sheets={sheets.weaponSheets} />}
          {weaponChildren}
          {/* will grow to fill the 100% height */}
          <Box flexGrow={1} display="flex" flexDirection="column" gap={1}>
            <ArtifactDisplay stats={stats} />
            {artifactChildren}
          </Box>
          <Stats stats={stats} />
        </CardContent>
      </ConditionalWrapper>
      {footer}
    </CardLight>
  </Suspense>
}
function Header({ onClick, characterSheet, stats: { characterKey, tlvl, characterLevel, ascension, constellation, characterEle, autoBoost, skillBoost, burstBoost } }:
  { onClick?: (characterKey: CharacterKey) => void, characterSheet: CharacterSheet, stats: ICalculatedStats }) {
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
      <Box flexGrow={1} sx={{ p: 1 }} display="flex" flexDirection="column" zIndex={1}>
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
            <Chip color={autoBoost ? "info" : "secondary"} label={<strong >{tlvl.auto + 1}</strong>} />
          </Grid>
          <Grid item>
            <Chip color={skillBoost ? "info" : "secondary"} label={<strong >{tlvl.skill + 1}</strong>} />
          </Grid>
          <Grid item>
            <Chip color={burstBoost ? "info" : "secondary"} label={<strong >{tlvl.burst + 1}</strong>} />
          </Grid>
        </Grid>
        <Typography mt={1} ><Stars stars={characterSheet.rarity} colored /></Typography>
      </Box>
    </Box>
  </ConditionalWrapper>
}
function Weapon({ weaponId, sheets }: { weaponId: string, sheets: Sheets["weaponSheets"] }) {
  const database = useContext(DatabaseContext)
  const weapon = database._getWeapon(weaponId)
  if (!weapon) return null;
  const weaponSheet = sheets[weapon.key]
  const { level, ascension } = weapon
  const name = weaponSheet?.name
  const mainVal = weaponSheet.getMainStatValue(level, ascension).toFixed(Stat.fixedUnit("atk"))
  const subKey = weaponSheet.getSubStatKey()
  const subVal = weaponSheet.getSubStatValue(level, ascension).toFixed(Stat.fixedUnit(subKey))
  const levelName = WeaponSheet.getLevelString(weapon as ICachedWeapon)
  const passiveName = weaponSheet?.passiveName
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
          {passiveName && <SqBadge color="info"> Refinement {weapon.refinement}</SqBadge>}
        </Typography>
        <Typography variant="subtitle1">ATK: {mainVal}</Typography>
        {passiveName && <Typography variant="subtitle2" lineHeight={1}>{Stat.getStatName(subKey)}: {subVal}{Stat.getStatUnit(subKey)}</Typography>}
      </Box>
    </Box>
  </CardDark>
}
function ArtifactDisplay({ stats }: { stats?: ICalculatedStats }) {
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const database = useContext(DatabaseContext)
  if (!artifactSheets || !stats) return null
  const { equippedArtifacts } = stats
  return <Grid container spacing={1} >
    {Object.entries(equippedArtifacts ?? {} as Dict<SlotKey, string>).map(([key, id]) => {
      const art = database._getArt(id)
      if (!art) return null
      const { setKey, slotKey, mainStatKey } = art
      return <Grid item key={key} flexGrow={1}>
        <Chip color="secondary" sx={{ width: "100%" }} icon={<ImgIcon src={artifactSheets?.[setKey].slotIcons[slotKey]} size={2.5} />}
          label={<span>{Stat.getStatNameWithPercent(mainStatKey)}</span>} />
      </Grid>
    })}
  </Grid>
}
function Stats({ stats }: { stats: ICalculatedStats }) {
  const statkeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "enerRech_",]
  return <Box sx={{ width: "100%" }} >
    {statkeys.map(statKey => {
      let unit = Stat.getStatUnit(statKey)
      let statVal = stats[statKey]
      return <Box sx={{ display: "flex" }} key={statKey}>
        <Typography flexGrow={1}><strong>{StatIcon[statKey]} {Stat.getStatName(statKey)}</strong></Typography>
        <Typography>
          {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
        </Typography>
      </Box>
    })}
  </Box>
}