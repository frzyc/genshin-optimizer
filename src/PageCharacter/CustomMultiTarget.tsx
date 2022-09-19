import { Add, ContentCopy, ContentPaste, DeleteForever, ExpandLess, ExpandMore, Settings } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonGroup, CardContent, Chip, Grid, MenuItem, Skeleton, styled, Tooltip, Typography } from "@mui/material";
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdditiveReactionModeText from "../Components/AdditiveReactionModeText";
import AmpReactionModeText from "../Components/AmpReactionModeText";
import CardDark from "../Components/Card/CardDark";
import CloseButton from "../Components/CloseButton";
import ColorText from "../Components/ColoredText";
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper, StyledInputBase } from "../Components/CustomNumberInput";
import DropdownButton from "../Components/DropdownMenu/DropdownButton";
import { infusionVals } from "../Components/HitModeEditor";
import ModalWrapper from "../Components/ModalWrapper";
import StatEditorList from "../Components/StatEditorList";
import { CharacterContext } from "../Context/CharacterContext";
import { DataContext } from "../Context/DataContext";
import { allInputPremodKeys, InputPremodKey } from "../Formula";
import { NodeDisplay, UIData } from "../Formula/uiData";
import useBoolState from "../ReactHooks/useBoolState";
import { CustomMultiTarget, CustomTarget } from "../Types/character";
import { AdditiveReactionKey, allAdditiveReactions, allAmpReactions, allHitModes, allInfusionAuraElements, allowedAdditiveReactions, allowedAmpReactions, AmpReactionKey, HitModeKey, InfusionAuraElements } from "../Types/consts";
import { arrayMove, clamp, deepClone, objPathValue } from "../Util/Util";
import OptimizationTargetSelector from "./CharacterDisplay/Tabs/TabOptimize/Components/OptimizationTargetSelector";
import { TargetSelectorModal } from "./CharacterDisplay/Tabs/TabOptimize/Components/TargetSelectorModal";

function initCustomMultiTarget() {
  return {
    name: "New Custom Target",
    targets: []
  }
}
function initCustomTarget(path: string[]): CustomTarget {
  return {
    weight: 1,
    path,
    hitMode: "avgHit",
    bonusStats: {}
  }
}
function validateOptTarget(path: string[]): string[] {
  // TODO: validate path. This function will probably need to be async
  return path
}
function validateCustomTarget(ct: any): CustomTarget | undefined {
  let { weight, path, hitMode, reaction, infusionAura, bonusStats } = ct

  if (typeof weight !== "number" || weight <= 0)
    weight = 1

  if (!Array.isArray(path) || path[0] === "custom")
    return undefined

  path = validateOptTarget(path)

  if (!hitMode || typeof hitMode !== "string" || !allHitModes.includes(hitMode as HitModeKey))
    hitMode = "avgHit"

  if (reaction && !allAmpReactions.includes(reaction) && !allAdditiveReactions.includes(reaction))
    reaction = undefined

  if (infusionAura && !allInfusionAuraElements.includes(infusionAura))
    infusionAura = undefined

  if (!bonusStats)
    bonusStats = {}

  bonusStats = Object.fromEntries(Object.entries(bonusStats).filter(([key, value]) =>
    allInputPremodKeys.includes(key as InputPremodKey) && typeof value == "number"
  ))

  return { weight, path, hitMode, reaction, infusionAura, bonusStats }
}
export function validateCustomMultiTarget(cmt: any): CustomMultiTarget | undefined {
  let { name, targets } = cmt
  if (typeof name !== "string")
    name = "New Custom Target"
  if (!Array.isArray(targets))
    return undefined
  targets = targets.map(t => validateCustomTarget(t)).filter(t => t)
  return { name, targets }
}

export function CustomMultiTargetButton() {
  const { t } = useTranslation("page_character")
  const [show, onShow, onCloseModal] = useBoolState()
  const { character, characterDispatch } = useContext(CharacterContext)
  const [customMultiTarget, setCustomTargets] = useState(() => character.customMultiTarget)

  useEffect(() => setCustomTargets(character.customMultiTarget),
    [setCustomTargets, character.customMultiTarget])

  const [expandedInd, setExpandedInd] = useState<number | false>(false);

  const addNewCustomMultiTarget = useCallback(() => {
    setCustomTargets([...customMultiTarget, initCustomMultiTarget()])
    setExpandedInd(customMultiTarget.length)
  }, [customMultiTarget, setCustomTargets, setExpandedInd])
  const setCustomMultiTarget = useCallback((ind: number, newTarget: CustomMultiTarget) => {
    const customTargets_ = [...customMultiTarget]
    customTargets_[ind] = newTarget
    setCustomTargets(customTargets_)
  }, [customMultiTarget, setCustomTargets])
  const deleteCustomMultiTarget = useCallback(ind => {
    if (customMultiTarget[ind].targets.length && !window.confirm(`Are you sure you want to delete "${customMultiTarget[ind].name}"?`)) return
    const customTargets_ = [...customMultiTarget]
    customTargets_.splice(ind, 1)
    setCustomTargets(customTargets_)
  }, [customMultiTarget, setCustomTargets])
  const dupCustomMultiTarget = useCallback(ind => {
    const customTargets_ = [...customMultiTarget]
    customTargets_.splice(ind, 0, customMultiTarget[ind])
    setCustomTargets(customTargets_)
  }, [customMultiTarget, setCustomTargets])
  const setOrder = useCallback((fromIndex: number) => (toIndex: number) => {
    toIndex = clamp(toIndex - 1, 0, customMultiTarget.length - 1)
    if (fromIndex === toIndex) return
    const arr = [...customMultiTarget]
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    setCustomTargets(arr)
  }, [customMultiTarget, setCustomTargets])
  const onClose = useCallback(
    () => {
      onCloseModal()
      characterDispatch({ customMultiTarget })
    }, [customMultiTarget, onCloseModal, characterDispatch])

  const { data: origUIData, teamData } = useContext(DataContext)
  const dataContextObj = useMemo(() => {

    // Make sure that the fields we're deleting belong to
    // copies. We don't need deep copies though, as the
    // rest of the Data are still intact.
    const origData = origUIData.data[0]
    const newData = { ...origData, hit: { ...origData.hit }, infusion: { ...origData.infusion } }
    delete newData.hit.reaction
    delete newData.infusion.team
    return {
      data: new UIData(newData, undefined),
      teamData
    }
  }, [origUIData, teamData])

  return <Suspense fallback={<Skeleton variant="rectangular" height="100%" width={100} />}>
    <Button color="info" onClick={onShow} startIcon={<Settings />}>{t`multiTarget.title`}</Button>
    <DataContext.Provider value={dataContextObj}>
      <ModalWrapper open={show} onClose={onClose} containerProps={{ sx: { overflow: "visible" } }}>
        <CardDark>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box display="flex" gap={1} justifyContent={"space-between"}>
              <Typography variant="h6">{t`multiTarget.title`}</Typography>
              <CloseButton onClick={onClose} />
            </Box>
            <Box>
              {customMultiTarget.map((ctar, i) => <CustomMultiTargetDisplay
                // Use a unique key, because indices dont allow for swapping very well.
                key={`${i}${JSON.stringify(ctar.targets)}`}
                index={i}
                expanded={i === expandedInd}
                onExpand={() => setExpandedInd(i === expandedInd ? false : i)}
                target={ctar}
                setTarget={(t) => setCustomMultiTarget(i, t)}
                onDelete={() => deleteCustomMultiTarget(i)}
                onDup={() => dupCustomMultiTarget(i)}
                onOrder={setOrder(i)}
                nTargets={customMultiTarget.length}
              />)}
              <Button fullWidth onClick={addNewCustomMultiTarget} startIcon={<Add />} sx={{ mt: 1 }}>{t`multiTarget.addNewMTarget`}</Button>
            </Box>
          </CardContent>
        </CardDark>
      </ModalWrapper>
    </DataContext.Provider>
  </Suspense>
}

function CustomMultiTargetDisplay({ index, target, setTarget, expanded, onExpand, onDelete, onDup, onOrder, nTargets }:
  { index: number, target: CustomMultiTarget, setTarget: (t: CustomMultiTarget) => void, expanded: boolean, onExpand: () => void, onDelete: () => void, onDup: () => void, onOrder: (nInd: number) => void, nTargets: number }) {
  const setName = useCallback((e) => setTarget({ ...target, name: e.target.value }), [setTarget, target])
  const addTarget = useCallback((t: string[]) => {
    const target_ = { ...target }
    target_.targets = [...target_.targets, initCustomTarget(t)]
    setTarget(target_)
  }, [target, setTarget])

  const setCustomTarget = useCallback((index: number, ctarget: CustomTarget) => {
    const targets = [...target.targets]
    targets[index] = ctarget
    setTarget({ ...target, targets })
  }, [target, setTarget])

  const deleteCustomTarget = useCallback((index: number) => {
    if (Object.values(target.targets[index].bonusStats).length && !window.confirm(`Are you sure you want to delete this target?`)) return
    const targets = [...target.targets]
    targets.splice(index, 1)
    setTarget({ ...target, targets })
  }, [target, setTarget])

  const setTargetIndex = useCallback((oldInd: number) => (newRank?: number) => {
    if (newRank === undefined || newRank === 0) return
    const newInd = newRank - 1
    const targets = [...target.targets]
    arrayMove(targets, oldInd, newInd)
    setTarget({ ...target, targets })
  }, [target, setTarget])

  const dupCustomTarget = useCallback((index: number) => () => {
    const targets = [...target.targets]
    targets.splice(index, 0, deepClone(targets[index]));
    setTarget({ ...target, targets })
  }, [target, setTarget])

  return <Accordion sx={{ bgcolor: "contentLight.main" }} expanded={expanded} >
    <AccordionSummary expandIcon={<Button color="info"
      sx={{ pointerEvents: "auto" }}
      onClick={onExpand}>
      <Settings />
      {expanded ? <ExpandLess /> : <ExpandMore />}
    </Button>}
      component="div"
      sx={{
        pointerEvents: "none",
        '& .MuiAccordionSummary-expandIconWrapper': {
          transform: "none"
        }
      }}
    >
      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap"
        sx={{ pointerEvents: "auto", width: "100%", pr: 1 }}
      >
        <Chip sx={{ minWidth: "8em" }} color={target.targets.length ? "success" : undefined} label={`${target.targets.length} Targets`}></Chip>
        <StyledInputBase value={target.name} sx={{ borderRadius: 1, px: 1, flexGrow: 1 }} onChange={setName} />
        <ButtonGroup size="small">
          <CustomNumberInputButtonGroupWrapper >
            <CustomNumberInput onChange={n => onOrder(n!)} value={index + 1}
              inputProps={{ min: 1, max: nTargets, sx: { textAlign: "center" } }}
              sx={{ width: "100%", height: "100%", pl: 2 }} />
          </CustomNumberInputButtonGroupWrapper>
          <Tooltip title="Duplicate" placement="top" >
            <Button onClick={onDup} color="info"><ContentCopy /></Button>
          </Tooltip>
          <Button color="error" onClick={onDelete} ><DeleteForever /></Button>
        </ButtonGroup>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <Box mb={1}>
        <CopyArea customMultiTarget={target} setCustomMultiTarget={setTarget} />
      </Box>
      <Box display="flex" gap={1} flexDirection="column">
        {target.targets.map((t, i) => <CustomTargetDisplay key={t.path.join() + i} customTarget={t} setCustomTarget={(ct) => setCustomTarget(i, ct)} deleteCustomTarget={() => deleteCustomTarget(i)} rank={i + 1} maxRank={target.targets.length} setTargetIndex={setTargetIndex(i)} onDup={dupCustomTarget(i)} />)}
        <AddCustomTargetBtn setTarget={addTarget} />
      </Box>

    </AccordionDetails>
  </Accordion>
}
const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element) => <Grid item xs={1}>{e}</Grid>
function CustomTargetDisplay({ customTarget, setCustomTarget, deleteCustomTarget, rank, maxRank, setTargetIndex, onDup }: { customTarget: CustomTarget, setCustomTarget: (t: CustomTarget) => void, deleteCustomTarget: () => void, rank: number, maxRank: number, setTargetIndex: (ind?: number) => void, onDup: () => void }) {
  const { t } = useTranslation("page_character")
  const { characterSheet } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { path, weight, hitMode, reaction, bonusStats, infusionAura } = customTarget
  const setWeight = useCallback(weight => setCustomTarget({ ...customTarget, weight }), [customTarget, setCustomTarget])
  const node = objPathValue(data.getDisplay(), path) as NodeDisplay | undefined
  const setFilter = useCallback((bonusStats) => setCustomTarget({ ...customTarget, bonusStats }), [customTarget, setCustomTarget])

  const isMeleeAuto = characterSheet?.isMelee() && (path[0] === "normal" || path[0] === "charged" || path[0] === "plunging")
  return <CardDark sx={{ display: "flex", }} >
    <Box sx={{ p: 1, flexGrow: 1 }} >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <CustomNumberInput float startAdornment="x" value={weight} onChange={setWeight} sx={{ borderRadius: 1, pl: 1 }} inputProps={{ sx: { pl: 0.5, width: "2em" }, min: 0 }} />
        <OptimizationTargetSelector optimizationTarget={path} setTarget={path => setCustomTarget({ ...customTarget, path, reaction: undefined, infusionAura: undefined })} ignoreGlobal targetSelectorModalProps={{ flatOnly: true, excludeSections: ["basic", "custom"] }} />
        <Box sx={{ flexGrow: 1 }} />
        {node && <ReactionDropdown reaction={reaction} setReactionMode={(rm) => setCustomTarget({ ...customTarget, reaction: rm })} node={node} infusionAura={infusionAura} />}
        <DropdownButton title={t(`hitmode.${hitMode}`)}>
          {allHitModes.map(hm => <MenuItem key={hm} value={hm} disabled={hitMode === hm} onClick={() => setCustomTarget({ ...customTarget, hitMode: hm })} >{t(`hitmode.${hm}`)}</MenuItem>)}
        </DropdownButton>
      </Box>
      <Grid container columns={{ xs: 1, lg: 2 }} sx={{ pt: 1 }} spacing={1}>
        {isMeleeAuto && <Grid item xs={1}>
          <DropdownButton title={infusionVals[infusionAura ?? ""]} color={infusionAura || "secondary"} disableElevation fullWidth >
            {Object.entries(infusionVals).map(([key, text]) =>
              <MenuItem key={key} sx={key ? { color: `${key}.main` } : undefined}
                selected={key === infusionAura} disabled={key === infusionAura}
                onClick={() => setCustomTarget({ ...customTarget, infusionAura: key ? key : undefined, reaction: undefined })}>{text}</MenuItem>)}
          </DropdownButton>
        </Grid>}
        <StatEditorList statKeys={keys} statFilters={bonusStats} setStatFilters={setFilter} wrapperFunc={wrapperFunc} />
      </Grid>
    </Box>
    <ButtonGroup orientation="vertical" sx={{ borderTopLeftRadius: 0, "*": { flexGrow: 1 } }}>
      <CustomNumberInputButtonGroupWrapper>
        <CustomNumberInput value={rank} onChange={setTargetIndex} sx={{ pl: 2 }} inputProps={{ sx: { width: "1em" }, min: 1, max: maxRank }} />
      </CustomNumberInputButtonGroupWrapper>
      <Button size="small" color="info" onClick={onDup} ><ContentCopy /></Button>
      <Button size="small" color="error" onClick={deleteCustomTarget} ><DeleteForever /></Button>
    </ButtonGroup>
  </CardDark >
}
function ReactionDropdown({ node, reaction, setReactionMode, infusionAura }: { node: NodeDisplay, reaction?: AmpReactionKey | AdditiveReactionKey, setReactionMode: (r?: AmpReactionKey | AdditiveReactionKey) => void, infusionAura?: InfusionAuraElements }) {
  const ele = node.info.variant ?? "physical"
  const { t } = useTranslation("page_character")

  if (!["pyro", "hydro", "cryo", "electro", "dendro"].some(e => e === ele || e === infusionAura)) return null
  const reactions = [...new Set([...allowedAmpReactions[ele] ?? [], ...allowedAmpReactions[infusionAura ?? ""] ?? [], ...allowedAdditiveReactions[ele] ?? []])]
  const title = reaction
    ? (([...allAmpReactions] as string[]).includes(reaction)
      ? <AmpReactionModeText reaction={reaction as AmpReactionKey} />
      : <AdditiveReactionModeText reaction={reaction as AdditiveReactionKey} />)
    : t`noReaction`
  return <DropdownButton title={title} sx={{ ml: "auto" }}>
    <MenuItem value="" disabled={!reaction} onClick={() => setReactionMode()} >No Reactions</MenuItem >
    {reactions.map(rm => <MenuItem key={rm} disabled={reaction === rm} onClick={() => setReactionMode(rm)}>
      {([...allAmpReactions] as string[]).includes(rm)
        ? <AmpReactionModeText reaction={rm} />
        : <AdditiveReactionModeText reaction={rm} />}
    </MenuItem >)}
  </DropdownButton>
}
function AddCustomTargetBtn({ setTarget }: { setTarget: (t: string[]) => void }) {
  const { t } = useTranslation("page_character")
  const [show, onShow, onClose] = useBoolState(false)
  const setTargetHandler = useCallback(
    (t: string[]) => {
      onClose()
      setTarget(t)
    }, [onClose, setTarget])

  return <>
    <Button fullWidth onClick={onShow} startIcon={<Add />} sx={{ mb: 1 }}>{t`multiTarget.addNewTarget`}</Button>
    <TargetSelectorModal ignoreGlobal flatOnly show={show} onClose={onClose} setTarget={setTargetHandler} excludeSections={["basic", "custom"]} />
  </>
}
const TextArea = styled("textarea")({
  width: "100%",
  fontFamily: "monospace",
  resize: "vertical",
  minHeight: "2em"
})
function CopyArea({ customMultiTarget, setCustomMultiTarget }: { customMultiTarget: CustomMultiTarget, setCustomMultiTarget: (t: CustomMultiTarget) => void }) {
  const [value, setValue] = useState(JSON.stringify(customMultiTarget))
  const [error, setError] = useState("")
  useEffect(() => {
    setError("")
    setValue(JSON.stringify(customMultiTarget))
  }, [customMultiTarget, setValue])
  const copyToClipboard = useCallback(
    () => navigator.clipboard.writeText(value)
      .then(() => alert("Copied configuration to clipboard."))
      .catch(console.error),
    [value],
  )
  const validate = useCallback(
    (v: string) => {
      setError("")
      setValue(v)
      try {
        const validated = validateCustomMultiTarget(JSON.parse(v))
        if (!validated) setError("Invalid Multi-Optimization Config")
        else setCustomMultiTarget(validated)
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      }
    },
    [setValue, setCustomMultiTarget],
  )

  return <Box>
    <Box display="flex" gap={1}>
      <TextArea value={value} sx={{ outlineColor: error ? "red" : undefined }} onClick={e => {
        const target = e.target as HTMLTextAreaElement;
        target.selectionStart = 0;
        target.selectionEnd = target.value.length;
      }} onChange={(e) => validate(e.target.value)} />
      <Button color="info" disabled={!!error} onClick={copyToClipboard}><ContentPaste /></Button>
    </Box>
    {!!error && <ColorText color="error"><Typography>{error}</Typography></ColorText>}
  </Box>
}
