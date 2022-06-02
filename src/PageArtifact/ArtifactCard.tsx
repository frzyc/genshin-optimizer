import { faBan, faChartLine, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BusinessCenter, Lock, LockOpen } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardActionArea, CardContent, Chip, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import React, { lazy, Suspense, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SlotNameWithIcon from '../Components/Artifact/SlotNameWIthIcon';
import CardLight from '../Components/Card/CardLight';
import CharacterAutocomplete from '../Components/Character/CharacterAutocomplete';
import LocationName from '../Components/Character/LocationName';
import ColorText from '../Components/ColoredText';
import ConditionalWrapper from '../Components/ConditionalWrapper';
import InfoTooltip from '../Components/InfoTooltip';
import SqBadge from '../Components/SqBadge';
import { Stars } from '../Components/StarDisplay';
import StatIcon from '../Components/StatIcon';
import Artifact from '../Data/Artifacts/Artifact';
import { ArtifactSheet } from '../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../Database/Database';
import KeyMap, { cacheValueString } from '../KeyMap';
import useArtifact from '../ReactHooks/useArtifact';
import usePromise from '../ReactHooks/usePromise';
import { allSubstatKeys, ICachedArtifact, ICachedSubstat, SubstatKey } from '../Types/artifact';
import { CharacterKey, Rarity } from '../Types/consts';
import { clamp, clamp01 } from '../Util/Util';
import PercentBadge from './PercentBadge';
import { probability } from './RollProbability';

const ArtifactEditor = lazy(() => import('./ArtifactEditor'))

type Data = {
  artifactId?: string,
  artifactObj?: ICachedArtifact,
  onClick?: (id: string) => void,
  onDelete?: (id: string) => void, mainStatAssumptionLevel?: number,
  effFilter?: Set<SubstatKey>,
  probabilityFilter?: Dict<SubstatKey, number>
  disableEditSetSlot?: boolean
  editor?: boolean,
  canExclude?: boolean
  canEquip?: boolean,
  extraButtons?: JSX.Element
}
const allSubstatFilter = new Set(allSubstatKeys)

export default function ArtifactCard({ artifactId, artifactObj, onClick, onDelete, mainStatAssumptionLevel = 0, effFilter = allSubstatFilter, probabilityFilter, disableEditSetSlot = false, editor = false, canExclude = false, canEquip = false, extraButtons }: Data): JSX.Element | null {
  const { t } = useTranslation(["artifact", "ui"]);
  const { database } = useContext(DatabaseContext)
  const databaseArtifact = useArtifact(artifactId)
  const sheet = usePromise(ArtifactSheet.get((artifactObj ?? databaseArtifact)?.setKey), [artifactObj, databaseArtifact])
  const equipOnChar = (charKey: CharacterKey | "") => database.setArtLocation(artifactId!, charKey)
  const editable = !artifactObj
  const [showEditor, setshowEditor] = useState(false)
  const onHideEditor = useCallback(() => setshowEditor(false), [setshowEditor])
  const onShowEditor = useCallback(() => editable && setshowEditor(true), [editable, setshowEditor])

  const wrapperFunc = useCallback(children => <CardActionArea onClick={() => artifactId && onClick?.(artifactId)} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }} >{children}</CardActionArea>, [onClick, artifactId],)
  const falseWrapperFunc = useCallback(children => <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }} >{children}</Box>, [])

  const art = artifactObj ?? databaseArtifact
  if (!art) return null

  const { id, lock, slotKey, rarity, level, mainStatKey, substats, exclude, location = "" } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const mainStatUnit = KeyMap.unit(mainStatKey)
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  const { currentEfficiency, maxEfficiency } = Artifact.getArtifactEfficiency(art, effFilter)
  const artifactValid = maxEfficiency !== 0
  const slotName = sheet?.getSlotName(slotKey) || "Unknown Piece Name"
  const slotDesc = sheet?.getSlotDesc(slotKey)
  const slotDescTooltip = slotDesc && <InfoTooltip title={<Box>
    <Typography variant='h6'>{slotName}</Typography>
    <Typography>{slotDesc}</Typography>
  </Box>} />
  const setEffects = sheet?.setEffects
  const setDescTooltip = sheet && setEffects && <InfoTooltip title={
    <span>
      {Object.keys(setEffects).map(setNumKey => <span key={setNumKey}>
        <Typography variant="h6"><SqBadge color="success">{t(`artifact:setEffectNum`, { setNum: setNumKey })}</SqBadge></Typography>
        <Typography>{sheet.setEffectDesc(setNumKey as any)}</Typography>
      </span>)}
    </span>
  } />
  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 350 }} />}>
    {editor && <Suspense fallback={false}>
      <ArtifactEditor
        artifactIdToEdit={showEditor ? artifactId : ""}
        cancelEdit={onHideEditor}
        disableEditSetSlot={disableEditSetSlot}
      />
    </Suspense>}
    <CardLight sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ConditionalWrapper condition={!!onClick} wrapper={wrapperFunc} falseWrapper={falseWrapperFunc}>
        <Box className={`grad-${rarity}star`} sx={{ position: "relative", width: "100%" }}>
          {!onClick && <IconButton color="primary" disabled={!editable} onClick={() => database.updateArt({ lock: !lock }, id)} sx={{ position: "absolute", right: 0, bottom: 0, zIndex: 2 }}>
            {lock ? <Lock /> : <LockOpen />}
          </IconButton>}
          <Box sx={{ pt: 2, px: 2, position: "relative", zIndex: 1 }}>
            {/* header */}
            <Box component="div" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip size="small" label={<strong>{` +${level}`}</strong>} color={levelVariant as any} />
              <Typography component="span" noWrap sx={{ backgroundColor: "rgba(100,100,100,0.35)", borderRadius: "1em", px: 1 }}><strong>{slotName}</strong></Typography>
              <Box flexGrow={1} sx={{ textAlign: "right" }}>
                {slotDescTooltip}
              </Box>
            </Box>
            <Typography color="text.secondary" variant="body2">
              <SlotNameWithIcon slotKey={slotKey} />
            </Typography>
            <Typography variant="h6" color={`${KeyMap.getVariant(mainStatKey)}.main`}>
              <span>{StatIcon[mainStatKey]} {KeyMap.get(mainStatKey)}</span>
            </Typography>
            <Typography variant="h5">
              <strong>
                <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{cacheValueString(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, KeyMap.unit(mainStatKey))}{mainStatUnit}</ColorText>
              </strong>
            </Typography>
            <Stars stars={rarity} colored />
            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Box>
          <Box sx={{ height: "100%", position: "absolute", right: 0, top: 0 }}>
            <Box
              component="img"
              src={sheet?.slotIcons[slotKey] ?? ""}
              width="auto"
              height="100%"
              sx={{ float: "right" }}
            />
          </Box>
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pt: 1, pb: 0, width: "100%" }}>
          {substats.map((stat: ICachedSubstat) => <SubstatDisplay key={stat.key} stat={stat} effFilter={effFilter} rarity={rarity} />)}
          <Box sx={{ display: "flex", my: 1 }}>
            <Typography color="text.secondary" component="span" variant="caption" sx={{ flexGrow: 1 }}>{t`artifact:editor.curSubEff`}</Typography>
            <PercentBadge value={currentEfficiency} max={900} valid={artifactValid} />
          </Box>
          {currentEfficiency !== maxEfficiency && <Box sx={{ display: "flex", mb: 1 }}>
            <Typography color="text.secondary" component="span" variant="caption" sx={{ flexGrow: 1 }}>{t`artifact:editor.maxSubEff`}</Typography>
            <PercentBadge value={maxEfficiency} max={900} valid={artifactValid} />
          </Box>}
          <Box flexGrow={1} />
          {probabilityFilter && <strong>Probability: {(probability(art, probabilityFilter) * 100).toFixed(2)}%</strong>}
          <Typography color="success.main">{sheet?.name ?? "Artifact Set"} {setDescTooltip}</Typography>
        </CardContent>
      </ConditionalWrapper>
      <Box sx={{ p: 1, display: "flex", gap: 1, justifyContent: "space-between", alignItems: "center" }}>
        {editable && canEquip
          ? <CharacterAutocomplete sx={{ flexGrow: 1 }} size="small" showDefault
            defaultIcon={<BusinessCenter />} defaultText={t("ui:inventory")}
            value={location} onChange={equipOnChar} />
          : <LocationName location={location} />}
        {editable && <ButtonGroup sx={{ height: "100%" }}>
          {editor && <Tooltip title={<Typography>{t`artifact:edit`}</Typography>} placement="top" arrow>
            <Button color="info" size="small" onClick={onShowEditor} >
              <FontAwesomeIcon icon={faEdit} className="fa-fw" />
            </Button>
          </Tooltip>}
          {canExclude && <Tooltip title={<Typography>{t`artifact:excludeArtifactTip`}</Typography>} placement="top" arrow>
            <Button onClick={() => database.updateArt({ exclude: !exclude }, id)} color={exclude ? "error" : "success"} size="small" >
              <FontAwesomeIcon icon={exclude ? faBan : faChartLine} className="fa-fw" />
            </Button>
          </Tooltip>}
          {!!onDelete && <Button color="error" size="small" onClick={() => onDelete(id)} disabled={lock}>
            <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
          </Button>}
          {extraButtons}
        </ButtonGroup>}
      </Box>
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
  const statName = KeyMap.getStr(stat.key)
  const unit = KeyMap.unit(stat.key)
  const inFilter = stat.key && effFilter.has(stat.key)
  return (<Box display="flex" gap={1} alignContent="center">
    <Typography sx={{ flexGrow: 1 }} color={(numRolls ? `${rollColor}.main` : "error.main") as any} component="span">{StatIcon[stat.key]} {statName}{`+${cacheValueString(stat.value, KeyMap.unit(stat.key))}${unit}`}</Typography>
    {inFilter && <Box display="flex" gap={0.25} height="1.3em">
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
