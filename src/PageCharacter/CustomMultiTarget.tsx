import { Add, ContentCopy, DeleteForever, ExpandLess, ExpandMore, Settings } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CardContent, Chip, Grid, MenuItem, Skeleton, Tooltip, Typography } from "@mui/material";
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AmpReactionModeText from "../Components/AmpReactionModeText";
import CardDark from "../Components/Card/CardDark";
import CloseButton from "../Components/CloseButton";
import CustomNumberInput, { StyledInputBase } from "../Components/CustomNumberInput";
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
import { allAmpReactions, allHitModes, allInfusionAuraElements, AmpReactionKey, HitModeKey } from "../Types/consts";
import { objPathValue } from "../Util/Util";
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

  if (typeof weight !== "number")
    weight = 1

  if (!Array.isArray(path) || path[0] === "custom")
    return undefined

  path = validateOptTarget(path)

  if (!hitMode || typeof hitMode !== "string" || !allHitModes.includes(hitMode as HitModeKey))
    hitMode = "avgHit"

  if (reaction && !allAmpReactions.includes(reaction))
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
  const [show, onShow, onCloseModal] = useBoolState()
  const { character, characterDispatch } = useContext(CharacterContext)
  const [customMultiTarget, setCustomTargets] = useState(character.customMultiTarget)

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
    <Button color="info" onClick={onShow} startIcon={<Settings />}>Custom Multi-Target Config</Button>
    <DataContext.Provider value={dataContextObj}>
      <ModalWrapper open={show} onClose={onClose} containerProps={{ sx: { overflow: "visible" } }}>
        <CardDark>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box display="flex" gap={1} justifyContent={"space-between"}>
              <Typography variant="h6">Custom Multi-Target Config</Typography>
              <CloseButton onClick={onClose} />
            </Box>
            <Box>
              {customMultiTarget.map((ctar, i) => <CustomMultiTargetDisplay
                key={i}
                index={i}
                expanded={i === expandedInd}
                onExpand={() => setExpandedInd(i === expandedInd ? false : i)}
                target={ctar}
                setTarget={(t) => setCustomMultiTarget(i, t)}
                onDelete={() => deleteCustomMultiTarget(i)}
                onDup={() => dupCustomMultiTarget(i)}
              />)}
              <Button fullWidth onClick={addNewCustomMultiTarget} startIcon={<Add />} sx={{ mt: 1 }}>Add New Custom Multi-target</Button>
            </Box>
          </CardContent>
        </CardDark>
      </ModalWrapper>
    </DataContext.Provider>
  </Suspense>
}

function CustomMultiTargetDisplay({ index, target, setTarget, expanded, onExpand, onDelete, onDup }:
  { index: number, target: CustomMultiTarget, setTarget: (t: CustomMultiTarget) => void, expanded: boolean, onExpand: () => void, onDelete: () => void, onDup: () => void }) {
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
    const targets = [...target.targets]
    targets.splice(index, 1)
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
        < StyledInputBase value={target.name} sx={{ borderRadius: 1, px: 1, flexGrow: 1 }} onChange={setName} />
        <Chip color={target.targets.length ? "success" : undefined} label={`${target.targets.length} Targets`}></Chip>
        <Tooltip title="Duplicate" placement="top" >
          <Button onClick={onDup}><ContentCopy /></Button>
        </Tooltip>
        <Button color="error" onClick={onDelete} ><DeleteForever /></Button>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      {/* <Box mb={1}>
        <CopyArea customMultiTarget={target} setCustomMultiTarget={setTarget} />
      </Box> */}
      <Box display="flex" gap={1} flexDirection="column">
        {target.targets.map((t, i) => <CustomTargetDisplay key={i} customTarget={t} setCustomTarget={(ct) => setCustomTarget(i, ct)} deleteCustomTarget={() => deleteCustomTarget(i)} />)}
        <AddCustomTargetBtn setTarget={addTarget} />
      </Box>

    </AccordionDetails>
  </Accordion>
}
const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element) => <Grid item xs={1}>{e}</Grid>
function CustomTargetDisplay({ customTarget, setCustomTarget, deleteCustomTarget }: { customTarget: CustomTarget, setCustomTarget: (t: CustomTarget) => void, deleteCustomTarget: () => void }) {
  const { t } = useTranslation("page_character")
  const { characterSheet } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { path, weight, hitMode, reaction, bonusStats, infusionAura } = customTarget
  const setWeight = useCallback(weight => setCustomTarget({ ...customTarget, weight }), [customTarget, setCustomTarget])
  const node: NodeDisplay = objPathValue(data.getDisplay(), path) as any
  const setFilter = useCallback((bonusStats) => setCustomTarget({ ...customTarget, bonusStats }), [customTarget, setCustomTarget])

  const isMeleeNorm = characterSheet?.isMelee() && path[0] === "normal"
  return <CardDark>
    <CardContent >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <CustomNumberInput float startAdornment="x" value={weight} onChange={setWeight} sx={{ borderRadius: 1, pl: 1 }} inputProps={{ sx: { textAlign: "center", width: "2em" } }} />
        <OptimizationTargetSelector optimizationTarget={path} setTarget={path => setCustomTarget({ ...customTarget, path })} ignoreGlobal targetSelectorModalProps={{ flatOnly: true, excludeSections: ["basic", "custom"] }} />
        <Box sx={{ flexGrow: 1 }} />
        <ReactionDropdown reaction={reaction} setReactionMode={(rm) => setCustomTarget({ ...customTarget, reaction: rm })} node={node} />
        <DropdownButton title={t(`hitmode.${hitMode}`)}>
          {allHitModes.map(hm => <MenuItem key={hm} value={hm} disabled={hitMode === hm} onClick={() => setCustomTarget({ ...customTarget, hitMode: hm })} >{t(`hitmode.${hm}`)}</MenuItem>)}
        </DropdownButton>
        <Button color="error" onClick={deleteCustomTarget} ><DeleteForever /></Button>
      </Box>
      <Grid container columns={{ xs: 1, md: 2, lg: 3 }} sx={{ pt: 1 }} spacing={1}>
        {isMeleeNorm && <Grid item xs={1}>
          <DropdownButton title={infusionVals[infusionAura ?? ""]} color={infusionAura || "secondary"} disableElevation fullWidth >
            {Object.entries(infusionVals).map(([key, text]) =>
              <MenuItem key={key} sx={key ? { color: `${key}.main` } : undefined}
                selected={key === infusionAura} disabled={key === infusionAura}
                onClick={() => setCustomTarget({ ...customTarget, infusionAura: key ? key : undefined })}>{text}</MenuItem>)}
          </DropdownButton>
        </Grid>}
        <StatEditorList statKeys={keys} statFilters={bonusStats} setStatFilters={setFilter} wrapperFunc={wrapperFunc} />
      </Grid>
    </CardContent>
  </CardDark>
}
function ReactionDropdown({ node, reaction, setReactionMode }: { node: NodeDisplay, reaction?: AmpReactionKey, setReactionMode: (r?: AmpReactionKey) => void }) {
  const ele = node.info.variant ?? "physical"
  const { t } = useTranslation("page_character")
  if (!["pyro", "hydro", "cryo"].includes(ele)) return null
  return <DropdownButton title={reaction ? <AmpReactionModeText reaction={reaction} /> : t`ampReaction.noReaction`} sx={{ ml: "auto" }}>
    <MenuItem value="" disabled={!reaction} onClick={() => setReactionMode()} >No Reactions</MenuItem >
    {allAmpReactions.map(rm => <MenuItem key={rm} disabled={reaction === rm} onClick={() => setReactionMode(rm)}>
      <AmpReactionModeText reaction={rm} />
    </MenuItem >)}
  </DropdownButton>
}
function AddCustomTargetBtn({ setTarget }: { setTarget: (t: string[]) => void }) {
  const [show, onShow, onClose] = useBoolState(false)
  const setTargetHandler = useCallback(
    (t: string[]) => {
      onClose()
      setTarget(t)
    }, [onClose, setTarget])

  return <>
    <Button fullWidth onClick={onShow} startIcon={<Add />} sx={{ mb: 1 }}>Add New Custom target</Button>
    <TargetSelectorModal ignoreGlobal flatOnly show={show} onClose={onClose} setTarget={setTargetHandler} excludeSections={["basic", "custom"]} />
  </>
}
// const TextArea = styled("textarea")({
//   width: "100%",
//   fontFamily: "monospace",
//   resize: "vertical",
//   minHeight: "2em"
// })
// function CopyArea({ customMultiTarget, setCustomMultiTarget }: { customMultiTarget: CustomMultiTarget, setCustomMultiTarget: (t: CustomMultiTarget) => void }) {
//   // TODO: target validation
//   return <Box display="flex" gap={1}>
//     <TextArea value={JSON.stringify(customMultiTarget)} onClick={e => {
//       const target = e.target as HTMLTextAreaElement;
//       target.selectionStart = 0;
//       target.selectionEnd = target.value.length;
//     }} onChange={(e) => console.log(JSON.parse(e.target.value) as CustomMultiTarget)} />
//     <Button><ContentPaste /></Button>
//   </Box>
// }
