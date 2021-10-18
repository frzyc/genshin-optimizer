import { faCalculator, faLink, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, CardActionArea, CardContent, CardHeader, Chip, Grid, Skeleton, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import usePromise from '../ReactHooks/usePromise';
import Stat from '../Stat';
import { ICachedCharacter } from '../Types/character';
import { CharacterKey } from '../Types/consts';
import { ICachedWeapon } from '../Types/weapon';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterSheet from './CharacterSheet';

type CharacterCardProps = { characterKey: CharacterKey | "", onEdit?: (any) => void, onDelete?: (any) => void, footer?: boolean }
export default function CharacterCard({ characterKey, onEdit, onDelete, footer = false }: CharacterCardProps) {
  const database = useContext(DatabaseContext)
  const [databaseCharacter, updateDatabaseCharacter] = useState(undefined as ICachedCharacter | undefined)
  useEffect(() =>
    characterKey ? database.followChar(characterKey, updateDatabaseCharacter) : undefined,
    [characterKey, updateDatabaseCharacter, database])

  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const character = databaseCharacter
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const weapon = character?.equippedWeapon ? database._getWeapon(character.equippedWeapon) : undefined
  const weaponSheet = usePromise(weapon ? WeaponSheet.get(weapon.key) : undefined, [weapon?.key])
  const stats = useMemo(() => character && characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, database, characterSheet, weaponSheet, artifactSheets), [character, characterSheet, weaponSheet, artifactSheets, database])
  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={() => onEdit?.(characterKey)} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</CardActionArea>,
    [onEdit, characterKey],
  )
  const deleteChar = useCallback(() => onDelete?.(characterKey), [onDelete, characterKey])

  if (!character || !weapon || !characterSheet || !weaponSheet || !stats) return null;
  const { constellation } = character
  const { level: weaponLevel, ascension: weaponAscension } = weapon
  const { tlvl, characterLevel, ascension } = stats

  const elementKey = stats.characterEle
  const weaponName = weaponSheet?.name
  const weaponMainVal = weaponSheet.getMainStatValue(weaponLevel, weaponAscension).toFixed(Stat.fixedUnit("atk"))
  const weaponSubKey = weaponSheet.getSubStatKey()
  const weaponSubVal = weaponSheet.getSubStatValue(weaponLevel, weaponAscension).toFixed(Stat.fixedUnit(weaponSubKey))
  const weaponLevelName = WeaponSheet.getLevelString(weapon as ICachedWeapon)
  const weaponPassiveName = weaponSheet?.passiveName
  const statkeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "enerRech_",]

  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 350 }} />}>
    <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ConditionalWrapper condition={!!onEdit} wrapper={actionWrapperFunc}>
        <Box className={`grad-${characterSheet.star}star`} width="100%" >
          <Grid container sx={{ flexWrap: "nowrap" }}>
            <Grid item flexGrow={1} sx={{ px: 2, pt: 1 }}>
              <CardHeader title={characterSheet.name} titleTypographyProps={{ variant: "subtitle1" }} sx={{ p: 0 }}
                avatar={<Typography variant="h5">{StatIcon[elementKey]}</Typography>} />
              <Grid container spacing={1}>
                <Grid item>
                  <Typography component="span" variant="h6">Lv. {characterLevel}</Typography>
                  <Typography component="span" variant="h6" color="text.secondary">/{ascensionMaxLevel[ascension]}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6"><SqBadge>C{constellation}</SqBadge></Typography>
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item>
                  <Chip color="secondary" label={<strong >{tlvl.auto + 1}</strong>} />
                </Grid>
                <Grid item>
                  <Chip color={stats.skillBoost ? "info" : "secondary"} label={<strong >{tlvl.skill + 1}</strong>} />
                </Grid>
                <Grid item>
                  <Chip color={stats.burstBoost ? "info" : "secondary"} label={<strong >{tlvl.burst + 1}</strong>} />
                </Grid>
              </Grid>
              {/* <Typography variant="h5">Refinement <strong>{refinement}</strong></Typography> */}
              <Typography><Stars stars={characterSheet.star} colored /></Typography>
            </Grid>
            {/* use flex-end here to align the image to the bottom. */}
            <Grid item container xs={3} md={4} alignContent="flex-end">
              <Box
                component="img"
                src={characterSheet.thumbImg}
                width="100%"
                height="auto"
                sx={{ mt: "auto" }}
              />
            </Grid>
          </Grid>
        </Box>
        <CardContent sx={{ pb: 0, width: "100%" }}>
          <CardDark sx={{ mb: 1 }}>
            <Grid container sx={{ flexWrap: "nowrap" }}>
              <Grid item container xs={3} md={4} alignContent="flex-end" className={`grad-${weaponSheet.rarity}star`} >
                <Box
                  component="img"
                  src={weaponSheet.img}
                  width="100%"
                  height="auto"
                  sx={{ mt: "auto" }}
                />
              </Grid>
              <Grid item flexGrow={1} sx={{ p: 1 }}>
                <Typography><strong>{weaponName}</strong></Typography>
                <Typography>
                  <SqBadge color="primary" sx={{ mr: 1 }}>Lv. {weaponLevelName}</SqBadge>
                  {weaponPassiveName && <SqBadge color="info"> Refinement {weapon.refinement}</SqBadge>}
                </Typography>
                <Typography variant="subtitle2">ATK: {weaponMainVal}</Typography>
                {weaponPassiveName && <Typography variant="subtitle2">{Stat.getStatName(weaponSubKey)}: {weaponSubVal}{Stat.getStatUnit(weaponSubKey)}</Typography>}
              </Grid>
            </Grid>
          </CardDark>
          <Grid container spacing={1} justifyContent="space-around">
            {artifactSheets && Object.entries(ArtifactSheet.setEffects(artifactSheets, stats.setToSlots)).map(([key, arr]) => {
              let artifactSetName = artifactSheets?.[key].name ?? ""
              let highestNum = Math.max(...arr)
              return <Grid item key={key} flexGrow={1}>
                <Chip color="secondary" sx={{ width: "100%" }} icon={<ImgIcon src={artifactSheets?.[key].defIconSrc} size={2.5} />}
                  label={<span>{artifactSetName} <SqBadge color="success">{highestNum}</SqBadge></span>} />
              </Grid>
            })}
          </Grid>
        </CardContent>
        {/* grow to fill the 100% heigh */}
        <Box flexGrow={1} />
        <CardContent sx={{ py: 1, width: "100%" }} >
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
        </CardContent>
      </ConditionalWrapper>
      {footer && <Grid container spacing={1} sx={{ py: 1, px: 2 }}>
        <Grid item>
          <Button size="small" component={Link} to={{
            pathname: "/build",
            characterKey
          } as any} startIcon={<FontAwesomeIcon icon={faCalculator} />}>Build</Button>
        </Grid>
        <Grid item flexGrow={1}>
          <Button size="small" color="info" component={Link} to={{ pathname: "/flex", characterKey } as any}
            startIcon={<FontAwesomeIcon icon={faLink} />}>Share</Button>
        </Grid>
        {!!onDelete && <Grid item>
          <Button size="small" color="error" startIcon={<FontAwesomeIcon icon={faTrash} />} onClick={deleteChar}>Delete</Button>
        </Grid>}
      </Grid>}
    </CardLight>
  </Suspense>
}
