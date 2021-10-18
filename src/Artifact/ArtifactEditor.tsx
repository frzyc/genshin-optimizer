import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Add, ExpandMore, Replay, Shuffle, Update } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, CardHeader, Collapse, Grid, MenuItem, Skeleton, Typography } from '@mui/material';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ArtifactRarityDropdown from '../Components/Artifact/ArtifactRarityDropdown';
import ArtifactSetDropdown from '../Components/Artifact/ArtifactSetDropdown';
import ArtifactSlotDropdown from '../Components/Artifact/ArtifactSlotDropdown';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../Components/CustomNumberInput';
import CustomNumberTextField from '../Components/CustomNumberTextField';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import ExpandButton from '../Components/ExpandButton';
import ImgIcon from '../Components/Image/ImgIcon';
import SqBadge from '../Components/SqBadge';
import { DatabaseContext } from '../Database/Database';
import { parseArtifact, validateArtifact } from '../Database/validation';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import Stat from '../Stat';
import { allSubstats, IArtifact, ICachedArtifact, ISubstat, MainStatKey } from '../Types/artifact';
import { ArtifactRarity, ArtifactSetKey, SlotKey } from '../Types/consts';
import { randomizeArtifact } from '../Util/ArtifactUtil';
import { valueString } from '../Util/UIUtil';
import { clamp, deepClone } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import { ArtifactSheet } from './ArtifactSheet';
import artifactSubstatRollCorrection from './artifact_sub_rolls_correction_gen.json';
import PercentBadge from './PercentBadge';
import TextButton from '../Components/TextButton';

const UploadDisplay = lazy(() => import('./UploadDisplay'))

type ArtifactEditorArgument = { artifactIdToEdit: string, cancelEdit: () => void }
const allSubstatFilter = new Set(allSubstats)

let uploadDisplayReset: (() => void) | undefined
export default function ArtifactEditor({ artifactIdToEdit, cancelEdit }: ArtifactEditorArgument) {
  const { t } = useTranslation("artifact")

  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  const database = useContext(DatabaseContext)

  const [expanded, setExpanded] = useState(() => !database._getArts().length)

  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(() => database.followAnyArt(setDirtyDatabase), [database, setDirtyDatabase])

  const [editorArtifact, artifactDispatch] = useReducer(artifactReducer, undefined)
  const artifact = useMemo(() => editorArtifact && parseArtifact(editorArtifact), [editorArtifact])

  const { old, oldType }: { old: ICachedArtifact | undefined, oldType: "edit" | "duplicate" | "upgrade" | "" } = useMemo(() => {
    const databaseArtifact = dirtyDatabase && database._getArt(artifactIdToEdit)
    if (databaseArtifact) return { old: databaseArtifact, oldType: "edit" }
    if (artifact === undefined) return { old: undefined, oldType: "" }
    const { duplicated, upgraded } = dirtyDatabase && database.findDuplicates(artifact)
    return { old: duplicated[0] ?? upgraded[0], oldType: duplicated.length !== 0 ? "duplicate" : "upgrade" }
  }, [artifact, artifactIdToEdit, database, dirtyDatabase])

  const { artifact: cachedArtifact, errors } = useMemo(() => {
    if (!artifact) return { artifact: undefined, errors: [] as Displayable[] }
    const validated = validateArtifact(artifact, artifactIdToEdit)
    if (old) {
      validated.artifact.location = old.location
      validated.artifact.exclude = old.exclude
    }
    return validated
  }, [artifact, artifactIdToEdit, old])

  // Overwriting using a different function from `databaseArtifact` because `useMemo` does not
  // guarantee to trigger *only when* dependencies change, which is necessary in this case.
  useEffect(() => {
    const databaseArtifact = dirtyDatabase && database._getArt(artifactIdToEdit)
    if (databaseArtifact) {
      setExpanded(true)
      artifactDispatch({ type: "overwrite", artifact: deepClone(databaseArtifact) })
    }
  }, [artifactIdToEdit, database, dirtyDatabase])

  const sheet = artifact ? artifactSheets?.[artifact.setKey] : undefined
  const getUpdloadDisplayReset = (reset: () => void) => uploadDisplayReset = reset
  const reset = useCallback(() => {
    cancelEdit?.();
    uploadDisplayReset?.()
    artifactDispatch({ type: "reset" })
  }, [cancelEdit, artifactDispatch])
  const update = useCallback((newValue: Partial<IArtifact>) => {
    const newSheet = newValue.setKey ? artifactSheets![newValue.setKey] : sheet!

    function pick<T>(value: T | undefined, available: readonly T[], prefer?: T): T {
      return (value && available.includes(value)) ? value : (prefer ?? available[0])
    }

    if (newValue.setKey) {
      newValue.rarity = pick(artifact?.rarity, newSheet.rarity, Math.max(...newSheet.rarity) as ArtifactRarity)
      newValue.slotKey = pick(artifact?.slotKey, newSheet.slots)
    }
    if (newValue.rarity)
      newValue.level = artifact?.level ?? 0
    if (newValue.level)
      newValue.level = clamp(newValue.level, 0, 4 * (newValue.rarity ?? artifact!.rarity))
    if (newValue.slotKey)
      newValue.mainStatKey = pick(artifact?.mainStatKey, Artifact.slotMainStats(newValue.slotKey))

    if (newValue.mainStatKey) {
      newValue.substats = [0, 1, 2, 3].map(i =>
        (artifact && artifact.substats[i].key !== newValue.mainStatKey) ? artifact!.substats[i] : { key: "", value: 0 })
    }
    artifactDispatch({ type: "update", artifact: newValue })
  }, [artifact, artifactSheets, sheet, artifactDispatch])
  const setSubstat = useCallback((index: number, substat: ISubstat) => {
    artifactDispatch({ type: "substat", index, substat })
  }, [artifactDispatch])
  const isValid = !errors.length
  const canClearArtifact = (): boolean => window.confirm(t`editor.clearPrompt` as string)
  const { rarity = 5, level = 0, slotKey = "flower" } = artifact ?? {}
  const { currentEfficiency = 0, maxEfficiency = 0 } = cachedArtifact ? Artifact.getArtifactEfficiency(cachedArtifact, allSubstatFilter) : {}
  return <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: expanded ? "100%" : 64 }} />}><CardDark >
    <CardHeader
      action={
        <ExpandButton
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMore />
        </ExpandButton>
      }
      title={<Trans t={t} i18nKey="editor.title" >Artifact Editor</Trans>}
    />
    <Collapse in={expanded} timeout="auto" unmountOnExit><CardContent sx={{ pt: 0 }}>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {/* Left column */}
        <Grid item xs={12} md={6} lg={6} sx={{
          // select all excluding last
          "> div:nth-last-of-type(n+2)": { mb: 1 }
        }}>
          {/* set & rarity */}
          <ButtonGroup sx={{ display: "flex", mb: 1 }}>
            {/* Artifact Set */}
            <ArtifactSetDropdown selectedSetKey={artifact?.setKey} onChange={setKey => update({ setKey: setKey as ArtifactSetKey })} sx={{ flexGrow: 1 }} />
            {/* rarity dropdown */}
            <ArtifactRarityDropdown rarity={artifact ? rarity : undefined} onChange={r => update({ rarity: r })} filter={r => !!sheet?.rarity?.includes?.(r)} disabled={!sheet} />
          </ButtonGroup>

          {/* level */}
          <Box component="div" display="flex">
            <CustomNumberTextField id="filled-basic" label="Level" variant="filled" sx={{ flexShrink: 1, flexGrow: 1, mr: 1, my: 0 }} margin="dense" size="small"
              value={level} disabled={!sheet} placeholder={`0~${rarity * 4}`} onChange={l => update({ level: l })}
            />
            <ButtonGroup >
              <Button onClick={() => update({ level: level - 1 })} disabled={!sheet || level === 0}>-</Button>
              {rarity ? [...Array(rarity + 1).keys()].map(i => 4 * i).map(i => <Button key={i} onClick={() => update({ level: i })} disabled={!sheet || level === i}>{i}</Button>) : null}
              <Button onClick={() => update({ level: level + 1 })} disabled={!sheet || level === (rarity * 4)}>+</Button>
            </ButtonGroup>
          </Box>

          {/* slot */}
          <Box component="div" display="flex">
            <ArtifactSlotDropdown disabled={!sheet} slotKey={slotKey} onChange={slotKey => update({ slotKey })} />
            <CardLight sx={{ p: 1, ml: 1, flexGrow: 1 }}>
              <Suspense fallback={<Skeleton width="60%" />}>
                <Typography color="text.secondary">
                  {sheet?.getSlotName(artifact!.slotKey) ? <span><ImgIcon src={sheet.slotIcons[artifact!.slotKey]} /> {sheet?.getSlotName(artifact!.slotKey)}</span> : t`editor.unknownPieceName`}
                </Typography>
              </Suspense>
            </CardLight>
          </Box>

          {/* main stat */}
          <Box component="div" display="flex">
            <DropdownButton title={<b>{artifact ? Stat.getStatNameWithPercent(artifact.mainStatKey) : t`mainStat`}</b>} disabled={!sheet} color={artifact ? "success" : "primary"} >
              {Artifact.slotMainStats(slotKey).map(mainStatK =>
                <MenuItem key={mainStatK} selected={artifact?.mainStatKey === mainStatK} disabled={artifact?.mainStatKey === mainStatK} onClick={() => update({ mainStatKey: mainStatK })} >{Stat.getStatNameWithPercent(mainStatK)}</MenuItem>)}
            </DropdownButton>
            <CardLight sx={{ p: 1, ml: 1, flexGrow: 1 }}>
              <Typography color="text.secondary">
                {artifact ? `${valueString(Artifact.mainStatValue(artifact.mainStatKey, rarity, level), Stat.getStatUnit(artifact.mainStatKey))}${Stat.getStatUnit(artifact.mainStatKey)}` : t`mainStat`}
              </Typography>
            </CardLight>
          </Box>

          {/* Current/Max Substats Efficiency */}
          <SubstatEfficiencyDisplayCard valid={isValid} efficiency={currentEfficiency} t={t} />
          {currentEfficiency !== maxEfficiency && <SubstatEfficiencyDisplayCard max valid={isValid} efficiency={maxEfficiency} t={t} />}

        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={6} lg={6} sx={{
          // select all excluding last
          "> div:nth-last-of-type(n+2)": { mb: 1 }
        }}>
          {/* substat selections */}
          {[0, 1, 2, 3].map((index) => <SubstatInput key={index} index={index} artifact={cachedArtifact} setSubstat={setSubstat} />)}
        </Grid>
      </Grid>

      {/* Duplicate/Updated/Edit UI */}
      {old && <Grid container sx={{ justifyContent: "space-around", my: 1 }} >
        <Grid item lg={4} md={6} >
          <Typography sx={{ textAlign: "center" }} variant="h6" color="text.secondary" >{t`editor.preview`}</Typography>
          <div><ArtifactCard artifactObj={cachedArtifact} /></div>
        </Grid>
        <Grid item lg={4} md={6} >
          <Typography sx={{ textAlign: "center" }} variant="h6" color="text.secondary" >{oldType !== "edit" ? (oldType === "duplicate" ? t`editor.dupArt` : t`editor.upArt`) : t`editor.beforeEdit`}</Typography>
          <div><ArtifactCard artifactObj={old} /></div>
        </Grid>
      </Grid>}

      {/* Image OCR */}
      <CardLight sx={{ mb: 1 }}>
        <CardContent>
          {/* TODO: artifactDispatch not overwrite */}
          <Suspense fallback={<Skeleton width="100%" height="100" />}>
            <UploadDisplay setState={state => artifactDispatch({ type: "overwrite", artifact: state })} setReset={getUpdloadDisplayReset} artifactInEditor={!!artifact} />
          </Suspense>
        </CardContent>
      </CardLight>

      {/* Error alert */}
      {!isValid && <Alert variant="filled" severity="error" sx={{ mb: 1 }}>{errors.map((e, i) => <div key={i}>{e}</div>)}</Alert>}

      {/* Buttons */}
      <Grid container spacing={2}>
        <Grid item>
          {oldType === "edit" ?
            <Button startIcon={<Add />} onClick={() => { database.updateArt(editorArtifact!, old!.id); reset() }} disabled={!editorArtifact || !isValid} color="primary">
              {t`editor.btnSave`}
            </Button> :
            <Button startIcon={<Add />} onClick={() => { database.createArt(artifact!); reset() }} disabled={!artifact || !isValid} color={oldType === "duplicate" ? "warning" : "primary"}>
              {t`editor.btnAdd`}
            </Button>}
        </Grid>
        <Grid item flexGrow={1}>
          <Button startIcon={<Replay />} disabled={!artifact} onClick={() => { canClearArtifact() && reset() }} color="error">{t`editor.btnClear`}</Button>
        </Grid>
        <Grid item>
          {process.env.NODE_ENV === "development" && <Button color="info" startIcon={<Shuffle />} onClick={async () => artifactDispatch({ type: "overwrite", artifact: await randomizeArtifact() })}>{t`editor.btnRandom`}</Button>}
        </Grid>
        {old && oldType !== "edit" && <Grid item>
          <Button startIcon={<Update />} onClick={() => { database.updateArt(editorArtifact!, old.id); reset() }} disabled={!editorArtifact || !isValid} color="success">{t`editor.btnUpdate`}</Button>
        </Grid>}
      </Grid>
    </CardContent></Collapse>
  </CardDark ></Suspense>
}

function SubstatEfficiencyDisplayCard({ efficiency, max = false, t, valid }) {
  const eff = max ? "maxSubEff" : "curSubEff"
  return <CardLight sx={{ py: 1, px: 2 }}>
    <Grid container spacing={1}>
      <Grid item>{t(`editor.${eff}`)}</Grid>
      <Grid item flexGrow={1}>
        <BootstrapTooltip placement="top" title={<span>
          <Typography variant="h6">{t(`editor.${eff}`)}</Typography>
          <Typography><Trans t={t} i18nKey={`editor.${eff}Desc`} /></Typography>
        </span>}>
          <span><Box component={FontAwesomeIcon} icon={faQuestionCircle} sx={{ cursor: "help" }} /></span>
        </BootstrapTooltip>
      </Grid>
      <Grid item xs="auto">
        <PercentBadge valid={valid} value={valid ? efficiency : "ERR"} />
      </Grid>
    </Grid>
  </CardLight>
}

function SubstatInput({ index, artifact, setSubstat }: { index: number, artifact: ICachedArtifact | undefined, setSubstat: (index: number, substat: ISubstat) => void, }) {
  const { t } = useTranslation("artifact")
  const { mainStatKey = "", rarity = 5 } = artifact ?? {}
  const { key = "", value = 0, rolls = [], efficiency = 0 } = artifact?.substats[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = Stat.getStatUnit(key), rollNum = rolls.length

  let error: string = "", rollData: readonly number[] = [], allowedRolls = 0

  if (artifact) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const rarity = artifact.rarity
    const { numUpgrades, high } = Artifact.rollInfo(rarity)
    const maxRollNum = numUpgrades + high - 3;
    allowedRolls = maxRollNum - rollNum
    rollData = key ? Artifact.getSubstatRollData(key, rarity) : []
  }
  const rollOffset = 7 - rollData.length

  if (!rollNum && key && value) error = error || t`editor.substat.error.noCalc`
  if (allowedRolls < 0) error = error || t("editor.substat.error.noOverRoll", { value: allowedRolls + rollNum })

  return <CardLight>
    <Box sx={{ display: "flex" }}>
      <ButtonGroup size="small" sx={{ width: "100%", display: "flex" }}>
        <DropdownButton title={key ? Stat.getStatNameWithPercent(key) : t('editor.substat.substatFormat', { value: index + 1 })} disabled={!artifact} color={key ? "success" : "primary"} sx={{ whiteSpace: "nowrap" }}>
          {key && <MenuItem onClick={() => setSubstat(index, { key: "", value: 0 })}>{t`editor.substat.noSubstat`}</MenuItem>}
          {allSubstats.filter(key => mainStatKey !== key)
            .map(k => <MenuItem key={k} selected={key === k} disabled={key === k} onClick={() => setSubstat(index, { key: k, value: 0 })} >
              {Stat.getStatNameWithPercent(k)}
            </MenuItem>)}
        </DropdownButton>
        <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }} >
          <CustomNumberInput
            float={unit === "%"}
            placeholder={t`editor.substat.selectSub`}
            value={key ? value : undefined}
            onChange={value => setSubstat(index, { key, value: value ?? 0 })}
            disabled={!key}
            error={!!error}
            sx={{
              px: 1,
            }}
            inputProps={{
              sx: { textAlign: "right" }
            }}
          />
        </CustomNumberInputButtonGroupWrapper>
        {!!rollData.length && <TextButton>{t`editor.substat.nextRolls`}</TextButton>}
        {rollData.map((v, i) => {
          let newValue = valueString(accurateValue + v, unit)
          newValue = artifactSubstatRollCorrection[rarity]?.[key]?.[newValue] ?? newValue
          return <Button key={i} color={`roll${clamp(rollOffset + i, 1, 6)}` as any} disabled={(value && !rollNum) || allowedRolls <= 0} onClick={() => setSubstat(index, { key, value: parseFloat(newValue) })}>{newValue}</Button>
        })}
      </ButtonGroup>
    </Box>
    <Box sx={{ p: 1, }}>
      {error ? <SqBadge color="error">{t`ui:error`}</SqBadge> : <Grid container>
        <Grid item>
          <SqBadge color={rollNum === 0 ? "secondary" : `roll${clamp(rollNum, 1, 6)}`}>
            {rollNum ? t("editor.substat.RollCount", { count: rollNum }) : t`editor.substat.noRoll`}
          </SqBadge>
        </Grid>
        <Grid item flexGrow={1}>
          {!!rolls.length && [...rolls].sort().map((val, i) =>
            <Typography component="span" key={i} color={`roll${clamp(rollOffset + rollData.indexOf(val), 1, 6)}.main`} sx={{ ml: 1 }} >{valueString(val, unit)}</Typography>)}
        </Grid>
        <Grid item xs="auto" flexShrink={1}>
          <Typography>
            <Trans t={t} i18nKey="editor.substat.eff" color="text.secondary">
              Efficiency: <PercentBadge valid={true} value={efficiency ? efficiency : t`editor.substat.noStat` as string} />
            </Trans>
          </Typography>
        </Grid>
      </Grid>}

    </Box>
  </CardLight >
}

type ResetMessage = { type: "reset" }
type SubstatMessage = { type: "substat", index: number, substat: ISubstat }
type OverwriteMessage = { type: "overwrite", artifact: IArtifact }
type UpdateMessage = { type: "update", artifact: Partial<IArtifact> }
type Message = ResetMessage | SubstatMessage | OverwriteMessage | UpdateMessage
interface IEditorArtifact {
  setKey: ArtifactSetKey,
  slotKey: SlotKey,
  level: number,
  rarity: ArtifactRarity,
  mainStatKey: MainStatKey,
  substats: ISubstat[],
}
function artifactReducer(state: IEditorArtifact | undefined, action: Message): IEditorArtifact | undefined {
  switch (action.type) {
    case "reset": return
    case "substat": {
      const { index, substat } = action
      const oldIndex = substat.key ? state!.substats.findIndex(current => current.key === substat.key) : -1
      if (oldIndex === -1 || oldIndex === index)
        state!.substats[index] = substat
      else  // Already in used, swap the items instead
        [state!.substats[index], state!.substats[oldIndex]] =
          [state!.substats[oldIndex], state!.substats[index]]
      return { ...state! }
    }
    case "overwrite": return action.artifact
    case "update": return { ...state!, ...action.artifact }
  }
}
