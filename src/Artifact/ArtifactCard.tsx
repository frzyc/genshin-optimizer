import { faBan, faChartLine, faEdit, faInfoCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Lock, LockOpen } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardActions, CardContent, CardMedia, Chip, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton';
import LocationName from '../Components/Character/LocationName';
import ColorText from '../Components/ColoredText';
import SqBadge from '../Components/SqBadge';
import { Stars } from '../Components/StarDisplay';
import { database as localDatabase, DatabaseContext } from '../Database/Database';
import usePromise from '../ReactHooks/usePromise';
import Stat from '../Stat';
import { allSubstats, ICachedArtifact, ICachedSubstat, SubstatKey } from '../Types/artifact';
import { CharacterKey } from '../Types/consts';
import { valueStringWithUnit } from '../Util/UIUtil';
import { clamp } from '../Util/Util';
import Artifact from './Artifact';
import { ArtifactSheet } from './ArtifactSheet';
import SlotNameWithIcon from './Component/SlotNameWIthIcon';
import PercentBadge from './PercentBadge';

type Data = { artifactId?: string, artifactObj?: ICachedArtifact, onEdit?: (string) => void, onDelete?: (string) => void, mainStatAssumptionLevel?: number, effFilter?: Set<SubstatKey> }
const allSubstatFilter = new Set(allSubstats)

export default function ArtifactCard({ artifactId, artifactObj, onEdit, onDelete, mainStatAssumptionLevel = 0, effFilter = allSubstatFilter }: Data): JSX.Element | null {
  const { t } = useTranslation(["artifact"]);
  const database = useContext(DatabaseContext)
  const [databaseArtifact, updateDatabaseArtifact] = useState(undefined as ICachedArtifact | undefined)
  useEffect(() =>
    artifactId ? database.followArt(artifactId, updateDatabaseArtifact) : undefined,
    [artifactId, updateDatabaseArtifact, database])
  const sheet = usePromise(ArtifactSheet.get((artifactObj ?? (artifactId ? database._getArt(artifactId) : undefined))?.setKey), [artifactObj, artifactId])
  const equipOnChar = (charKey: CharacterKey | "") => database.setArtLocation(artifactId!, charKey)

  const editable = !artifactObj && database === localDatabase // dont allow edit for flex artifacts
  const art = artifactObj ?? databaseArtifact
  if (!art) return null

  const { id, lock, slotKey, rarity, level, mainStatKey, substats, exclude, location = "" } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  const mainStatVal = <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{valueStringWithUnit(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, Stat.getStatUnit(mainStatKey))}</ColorText>
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
      <CardContent className={`grad-${rarity}star`} sx={{ py: 1 }}>
        <Box component="div" sx={{ display: "flex", alignItems: "center" }}>
          <Chip label={<strong>{` +${level}`}</strong>} color={levelVariant as any} />
          <Typography sx={{ pl: 1, flexGrow: 1 }}>{slotName} {slotDescTooltip}</Typography>
          <IconButton color="secondary" disabled={!editable} onClick={() => database.updateArt({ lock: !lock }, id)}>
            {lock ? <Lock /> : <LockOpen />}
          </IconButton>
        </Box>
        <Grid container sx={{ flexWrap: "nowrap" }}>
          <Grid item flexGrow={1}>
            <Typography color="text.secondary" variant="body2">
              <SlotNameWithIcon slotKey={slotKey} />
            </Typography>
            <Typography variant="h6">
              {Stat.getStatName(mainStatKey)}
            </Typography>
            <Typography variant="h5">
              <strong>{mainStatVal}</strong>
            </Typography>
            <Stars stars={rarity} colored />
            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Grid>
          <Grid item xs={3} md={4}>
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
        {substats.map((stat: ICachedSubstat, i) => {
          if (!stat.value) return null
          const numRolls = stat.rolls?.length ?? 0
          const rollColor = `roll${clamp(numRolls, 1, 6)}`
          const efficiency = stat.efficiency ?? 0
          const effOpacity = 0.3 + (efficiency / 100) * 0.7
          const statName = Stat.getStatName(stat.key)
          return (<Box key={i} sx={{ display: "flex" }}>
            <Box sx={{ flexGrow: 1 }}>
              <SqBadge color={(numRolls ? rollColor : "error") as any} sx={{ mr: 1 }}><strong>{numRolls ? numRolls : "?"}</strong></SqBadge>
              <Typography color={(numRolls ? `${rollColor}.main` : "error.main") as any} component="span">{statName}{`+${valueStringWithUnit(stat.value, Stat.getStatUnit(stat.key))}`}</Typography>
            </Box>
            <Typography sx={{ opacity: effOpacity }}>{stat.key && effFilter.has(stat.key) ? valueStringWithUnit(efficiency, "eff") : "-"}</Typography>
          </Box>)
        })}
        <Box sx={{ display: "flex", my: 1 }}>
          <Typography color="text.secondary" component="span" variant="caption" sx={{ flexGrow: 1 }}>{t`editor.curSubEff`}</Typography>
          <PercentBadge value={currentEfficiency} valid={artifactValid} />
        </Box>
        {currentEfficiency !== maxEfficiency && <Box sx={{ display: "flex", mb: 1 }}>
          <Typography color="text.secondary" component="span" variant="caption" sx={{ flexGrow: 1 }}>{t`editor.maxSubEff`}</Typography>
          <PercentBadge value={maxEfficiency} valid={artifactValid} />
        </Box>}
        <Box flexGrow={1} />
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
