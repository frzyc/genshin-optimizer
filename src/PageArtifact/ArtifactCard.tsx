import { faBan, faChartLine, faEdit, faInfoCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Lock, LockOpen } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardActions, CardContent, CardMedia, Chip, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import React, { Suspense, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import SlotNameWithIcon from '../Components/Artifact/SlotNameWIthIcon';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton';
import LocationName from '../Components/Character/LocationName';
import ColorText from '../Components/ColoredText';
import SqBadge from '../Components/SqBadge';
import { Stars } from '../Components/StarDisplay';
import StatIcon from '../Components/StatIcon';
import Artifact from '../Data/Artifacts/Artifact';
import { ArtifactSheet } from '../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../Database/Database';
import KeyMap, { cacheValueString } from '../KeyMap';
import useArtifact from '../ReactHooks/useArtifact';
import usePromise from '../ReactHooks/usePromise';
import { allSubstats, ICachedArtifact, ICachedSubstat, SubstatKey } from '../Types/artifact';
import { CharacterKey, Rarity } from '../Types/consts';
import { clamp, clamp01 } from '../Util/Util';
import PercentBadge from './PercentBadge';
import { probability } from './RollProbability';

type Data = {
  artifactId?: string,
  artifactObj?: ICachedArtifact,
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void, mainStatAssumptionLevel?: number,
  effFilter?: Set<SubstatKey>,
  probabilityFilter?: Dict<SubstatKey, number>
}
const allSubstatFilter = new Set(allSubstats)

export default function ArtifactCard({ artifactId, artifactObj, onEdit, onDelete, mainStatAssumptionLevel = 0, effFilter = allSubstatFilter, probabilityFilter }: Data): JSX.Element | null {
  const { t } = useTranslation(["artifact"]);
  const { database } = useContext(DatabaseContext)
  const databaseArtifact = useArtifact(artifactId)
  const sheet = usePromise(ArtifactSheet.get((artifactObj ?? databaseArtifact)?.setKey), [artifactObj, databaseArtifact])
  const equipOnChar = (charKey: CharacterKey | "") => database.setArtLocation(artifactId!, charKey)

  const editable = !artifactObj
  const art = artifactObj ?? databaseArtifact
  if (!art) return null

  const { id, lock, slotKey, rarity, level, mainStatKey, substats, exclude, location = "" } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const mainStatUnit = KeyMap.unit(mainStatKey) === "flat" ? null : KeyMap.unit(mainStatKey)
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  const mainStatVal = <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{cacheValueString(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, KeyMap.unit(mainStatKey))}</ColorText>
  const { currentEfficiency, maxEfficiency } = Artifact.getArtifactEfficiency(art, effFilter)
  const artifactValid = maxEfficiency !== 0
  const slotName = sheet?.getSlotName(slotKey) || "Unknown Piece Name"
  const slotDesc = sheet?.getSlotDesc(slotKey)
  const slotDescTooltip = slotDesc && <BootstrapTooltip placement="top" title={<Typography>{slotDesc}</Typography>}>
    <span><FontAwesomeIcon icon={faInfoCircle} /></span>
  </BootstrapTooltip>
  const setEffects = sheet?.setEffects
  const setDescTooltip = sheet && setEffects && <BootstrapTooltip placement="top" title={
    <span>
      {Object.keys(setEffects).map(setNumKey => <span key={setNumKey}>
        <Typography variant="h6"><SqBadge color="success">{t(`setEffectNum`, { setNum: setNumKey })}</SqBadge></Typography>
        <Typography>{sheet.setEffectDesc(setNumKey as any)}</Typography>
      </span>)}
    </span>
  }>
    <span><FontAwesomeIcon icon={faInfoCircle} /></span>
  </BootstrapTooltip>
  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 350 }} />}>
    <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent className={`grad-${rarity}star`} sx={{ pt: 1, pb: 0, pr: 0 }}>
        <Box component="div" sx={{ display: "flex", alignItems: "center", pr: 1 }}>
          <Chip size="small" label={<strong>{` +${level}`}</strong>} color={levelVariant as any} />
          <Typography sx={{ pl: 1, flexGrow: 1 }}>{slotName} {slotDescTooltip}</Typography>
          <IconButton color="primary" disabled={!editable} onClick={() => database.updateArt({ lock: !lock }, id)}>
            {lock ? <Lock /> : <LockOpen />}
          </IconButton>
        </Box>
        <Grid container sx={{ flexWrap: "nowrap" }}>
          <Grid item flexGrow={1}>
            <Typography color="text.secondary" variant="body2">
              <SlotNameWithIcon slotKey={slotKey} />
            </Typography>
            <Typography variant="h6" color={`${KeyMap.getVariant(mainStatKey)}.main`}>
              <span>{StatIcon[mainStatKey]} {KeyMap.get(mainStatKey)}</span>
            </Typography>
            <Typography variant="h5">
              <strong>{mainStatVal}{mainStatUnit}</strong>
            </Typography>
            <Stars stars={rarity} colored />
            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Grid>
          <Grid item maxWidth="40%" sx={{ mt: -3, mb: -1, pl: -2 }} alignSelf="flex-end">
            <CardMedia
              component="img"
              image={sheet?.slotIcons[slotKey] ?? ""}
              width="100%"
              height="auto"
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pt: 1, pb: 0 }}>
        {substats.map((stat: ICachedSubstat) => <SubstatDisplay key={stat.key} stat={stat} effFilter={effFilter} rarity={rarity} />)}
        <Box sx={{ display: "flex", my: 1 }}>
          <Typography color="text.secondary" component="span" variant="caption" sx={{ flexGrow: 1 }}>{t`editor.curSubEff`}</Typography>
          <PercentBadge value={currentEfficiency} max={900} valid={artifactValid} />
        </Box>
        {currentEfficiency !== maxEfficiency && <Box sx={{ display: "flex", mb: 1 }}>
          <Typography color="text.secondary" component="span" variant="caption" sx={{ flexGrow: 1 }}>{t`editor.maxSubEff`}</Typography>
          <PercentBadge value={maxEfficiency} max={900} valid={artifactValid} />
        </Box>}
        <Box flexGrow={1} />
        {probabilityFilter && <strong>Probability: {(probability(art, probabilityFilter) * 100).toFixed(2)}%</strong>}
        <Typography color="success.main">{sheet?.name ?? "Artifact Set"} {setDescTooltip}</Typography>
      </CardContent>
      <CardActions>
        <Grid container sx={{ flexWrap: "nowrap" }}>
          <Grid item xs="auto" flexShrink={1}>
            {editable ?
              <CharacterDropdownButton size="small" inventory value={location} onChange={equipOnChar} /> : <LocationName location={location} />}
          </Grid>
          <Grid item flexGrow={1} sx={{ mr: 1 }} />
          {editable && <Grid item xs="auto">
            <ButtonGroup sx={{ height: "100%" }}>
              {!!onEdit && <Button color="info" onClick={() => onEdit(id)} size="small">
                <FontAwesomeIcon icon={faEdit} className="fa-fw" />
              </Button>}
              <Tooltip title={<Typography>{t`excludeArtifactTip`}</Typography>} placement="top" arrow>
                <Button onClick={() => database.updateArt({ exclude: !exclude }, id)} color={exclude ? "error" : "success"} size="small">
                  <FontAwesomeIcon icon={exclude ? faBan : faChartLine} className="fa-fw" />
                </Button>
              </Tooltip>
              {!!onDelete && <Button color="error" size="small" onClick={() => onDelete(id)} disabled={lock}>
                <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
              </Button>}
            </ButtonGroup>
          </Grid>}
        </Grid>
      </CardActions>
    </CardLight >
  </Suspense>
}
function SubstatDisplay({ stat, effFilter, rarity }: { stat: ICachedSubstat, effFilter: Set<SubstatKey>, rarity: Rarity }) {
  if (!stat.value) return null
  const numRolls = stat.rolls?.length ?? 0
  const maxRoll = stat.key ? Artifact.maxSubstatValues(stat.key) : 0
  const rollData = stat.key ? Artifact.getSubstatRollData(stat.key, rarity) : []
  const rollOffset = 7 - rollData.length
  const rollColor = `roll${clamp(numRolls, 1, 6)}`
  const efficiency = stat.efficiency ?? 0
  const effOpacity = clamp01(0.5 + (efficiency / (100 * 5)) * 0.5) //divide by 6 because an substat can have max 6 rolls
  // TODO: make the displaying of statname & unit with % less jank
  const statName = KeyMap.getStr(stat.key)?.split("%")[0]
  const unit = KeyMap.unit(stat.key) === "flat" ? "" : "%"
  const inFilter = stat.key && effFilter.has(stat.key)
  return (<Box display="flex" gap={1} alignContent="center">
    <Typography sx={{ flexGrow: 1 }} color={(numRolls ? `${rollColor}.main` : "error.main") as any} component="span">{StatIcon[stat.key]} {statName}{`+${cacheValueString(stat.value, KeyMap.unit(stat.key))}${unit}`}</Typography>
    {inFilter && <Box display="flex" gap={0.25} height="90%">
      {stat.rolls.sort().map((v, i) => <SmolProgress key={`${i}${v}`} value={100 * v / maxRoll} color={`roll${clamp(rollOffset + rollData.indexOf(v), 1, 6)}.main`} />)}
    </Box>}
    <Typography sx={{ opacity: effOpacity, minWidth: 40, textAlign: "right" }}>{inFilter ? `${efficiency.toFixed()}%` : "-"}</Typography>
  </Box>)
}
export function SmolProgress({ color = "red", value = 50 }) {
  return <Box sx={{ width: 7, height: "100%", bgcolor: color, overflow: "hidden", borderRadius: 1, display: "inline-block" }}>
    <Box sx={{ width: 10, height: `${100 - clamp(value, 0, 100)}%`, bgcolor: "gray" }} />
  </Box>
}
