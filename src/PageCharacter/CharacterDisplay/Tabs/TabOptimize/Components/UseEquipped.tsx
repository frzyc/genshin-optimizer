import { Add, CheckBox, CheckBoxOutlineBlank, Close, KeyboardArrowDown, KeyboardArrowUp, KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, Replay, Settings } from "@mui/icons-material";
import { Box, Button, ButtonGroup, CardContent, Divider, Grid, Typography } from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import ArtifactCardPico from "../../../../../Components/Artifact/ArtifactCardPico";
import CardDark from "../../../../../Components/Card/CardDark";
import CardLight from "../../../../../Components/Card/CardLight";
import CharacterCardPico from "../../../../../Components/Character/CharacterCardPico";
import { CharacterSelectionModal } from "../../../../../Components/Character/CharacterSelectionModal";
import CloseButton from "../../../../../Components/CloseButton";
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../../../../../Components/CustomNumberInput";
import ModalWrapper from "../../../../../Components/ModalWrapper";
import SqBadge from "../../../../../Components/SqBadge";
import WeaponCardPico from "../../../../../Components/Weapon/WeaponCardPico";
import { DatabaseContext } from "../../../../../Database/Database";
import { DataContext } from "../../../../../DataContext";
import useBoolState from "../../../../../ReactHooks/useBoolState";
import useCharacter from "../../../../../ReactHooks/useCharacter";
import { ICachedCharacter } from "../../../../../Types/character";
import { CharacterKey } from "../../../../../Types/consts";
import { useOptimizeDBState } from "../DBState";

export default function UseEquipped({ useEquippedArts, buildSettingsDispatch, disabled }) {
  const { t } = useTranslation("page_character")
  const { character: { key: characterKey } } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState(false)
  const [{ equipmentPriority: tempEquipmentPriority }, setOptimizeDBState] = useOptimizeDBState()
  //Basic validate for the equipmentPrio list to remove dups and characters that doesnt exist.
  const equipmentPriority = useMemo(() => [...new Set(tempEquipmentPriority)].filter(ck => database._getChar(ck)), [database, tempEquipmentPriority])
  const setPrio = useCallback((equipmentPriority: CharacterKey[]) => setOptimizeDBState({ equipmentPriority }), [setOptimizeDBState])

  const setPrioRank = useCallback((fromIndex, toIndex) => {
    const arr = [...equipmentPriority]
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    setPrio(arr)
  }, [equipmentPriority, setPrio])
  const removePrio = useCallback((fromIndex) => {
    const arr = [...equipmentPriority]
    arr.splice(fromIndex, 1)
    setPrio(arr)
  }, [equipmentPriority, setPrio])
  const addPrio = useCallback((ck: CharacterKey) => setPrio([...equipmentPriority, ck]), [equipmentPriority, setPrio])
  const resetPrio = useCallback(() => setPrio([]), [setPrio])

  const numAbove = useMemo(() => {
    let numAbove = equipmentPriority.length
    const index = equipmentPriority.indexOf(characterKey)
    if (index >= 0) numAbove = index
    return numAbove
  }, [characterKey, equipmentPriority])
  const numUseEquippedChar = useMemo(() => {
    return database._getCharKeys().length - 1 - numAbove
  }, [numAbove, database])
  const numUnlisted = useMemo(() => {
    return database._getCharKeys().length - equipmentPriority.length
  }, [equipmentPriority, database])

  return <Box display="flex" gap={1}>
    <ModalWrapper open={show} onClose={onClose} containerProps={{ maxWidth: "sm" }}><CardDark>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item flexGrow={1}>
            <Typography variant="h6"><Trans t={t} i18nKey="tabOptimize.useEquipped.modal.title">Character Priority for Equipped Artifacts</Trans></Typography>
          </Grid>
          <Grid item sx={{ mb: -1 }}>
            <CloseButton onClick={onClose} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent>
        <CardLight sx={{ mb: 1 }}>
          <CardContent>
            <Typography gutterBottom><Trans t={t} i18nKey="tabOptimize.useEquipped.modal.desc1">When generating a build, the Optimizer will only consider equipped artifacts from characters below the current character or those not on the list.</Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="tabOptimize.useEquipped.modal.desc2">If the current character is not on the list, the Optimizer will only consider equipped artifacts from others characters that are not on the list.</Trans></Typography>
          </CardContent>
        </CardLight>
        <Box display="flex" flexDirection="column" gap={2}>
          {equipmentPriority.map((ck, i) =>
            <SelectItem key={ck} characterKey={ck} rank={i + 1} maxRank={equipmentPriority.length} setRank={(num) => num && setPrioRank(i, num - 1)} onRemove={() => removePrio(i)} numAbove={numAbove} />)}
          <Box sx={{ display: "flex", gap: 1 }}>
            <NewItem onAdd={addPrio} list={equipmentPriority} />
            <Button color="error" onClick={resetPrio} startIcon={<Replay />}><Trans t={t} i18nKey="tabOptimize.useEquipped.modal.clearList">Clear List</Trans></Button>
          </Box>
          {!!numUseEquippedChar && <SqBadge color="success"><Typography><Trans t={t} i18nKey="tabOptimize.useEquipped.modal.usingNum" count={numUnlisted}>Using artifacts from <strong>{{ count: numUnlisted }}</strong> unlisted characters</Trans></Typography></SqBadge>}
        </Box>
      </CardContent>
    </CardDark ></ModalWrapper>
    <ButtonGroup sx={{ display: "flex", width: "100%" }}>
      <Button sx={{ flexGrow: 1 }} onClick={() => buildSettingsDispatch({ useEquippedArts: !useEquippedArts })} disabled={disabled} startIcon={useEquippedArts ? <CheckBox /> : <CheckBoxOutlineBlank />} color={useEquippedArts ? "success" : "secondary"}>
        <Box>
          <span><Trans t={t} i18nKey="tabOptimize.useEquipped.title">Use Equipped Artifacts</Trans></span>
          {useEquippedArts && <SqBadge><Trans t={t} i18nKey="tabOptimize.useEquipped.usingNum" count={numUseEquippedChar}>Using from <strong>{{ count: numUseEquippedChar }}</strong> characters</Trans></SqBadge>}
        </Box>
      </Button>
      {useEquippedArts && <Button sx={{ flexShrink: 1 }} color="info" onClick={onOpen}><Settings /></Button>}
    </ButtonGroup>
  </Box>
}

const itemSize = 60
function SelectItem({ characterKey, rank, maxRank, setRank, onRemove, numAbove }: {
  characterKey: CharacterKey,
  rank: number,
  maxRank: number,
  setRank: (r: number | undefined) => void,
  onRemove: () => void,
  numAbove: number,
}) {
  const { t } = useTranslation("page_character")
  const { database } = useContext(DatabaseContext)
  const character = useCharacter(characterKey)
  if (!character) return null
  const { equippedWeapon, equippedArtifacts } = character
  return <CardLight sx={{ p: 1 }}  >
    <Box sx={{ pb: 1, display: "flex", justifyContent: "space-between", gap: 1 }}>
      <SqBadge color="info">
        <Typography>#{rank}</Typography>
      </SqBadge>
      <SqBadge sx={{ flexGrow: 1 }} color={numAbove === (rank - 1) ? "warning" : (rank - 1) < numAbove ? "error" : "success"}>
        <Typography>{numAbove === (rank - 1) ? <Trans t={t} i18nKey="tabOptimize.useEquipped.modal.status.curr">Current character</Trans>
          : (rank - 1) < numAbove ? <Trans t={t} i18nKey="tabOptimize.useEquipped.modal.status.dont">Don't Use artifacts</Trans> :
            <Trans t={t} i18nKey="tabOptimize.useEquipped.modal.status.use">Use artifacts</Trans>}</Typography>
      </SqBadge>
      <Box>
        <ButtonGroup sx={{ flexGrow: 1 }} size="small">
          <CustomNumberInputButtonGroupWrapper >
            <CustomNumberInput onChange={setRank} value={rank}
              // startAdornment="Rank:"
              inputProps={{ min: 1, max: maxRank, sx: { textAlign: "center" } }}
              sx={{ width: "100%", height: "100%", pl: 2 }} />
          </CustomNumberInputButtonGroupWrapper>
          <Button disabled={rank === 1} onClick={() => setRank(1)} >
            <KeyboardDoubleArrowUp />
          </Button>
          <Button disabled={rank === 1} onClick={() => setRank(rank - 1)}  >
            <KeyboardArrowUp />
          </Button>
          <Button disabled={rank === maxRank} onClick={() => setRank(rank + 1)}  >
            <KeyboardArrowDown />
          </Button>
          <Button disabled={rank === maxRank} onClick={() => setRank(maxRank)}  >
            <KeyboardDoubleArrowDown />
          </Button>
          <Button color="error" onClick={onRemove}>
            <Close />
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
    <Grid container columns={7} spacing={1}>
      <Grid item xs={1} >
        <CharacterCardPico characterKey={characterKey} />
      </Grid>
      <Grid item xs={1}><WeaponCardPico weaponId={equippedWeapon} /></Grid>
      {Object.entries(equippedArtifacts).map(([slotKey, aId]) => <Grid item xs={1} key={slotKey} ><ArtifactCardPico slotKey={slotKey} artifactObj={database._getArt(aId)} /></Grid>)}
    </Grid>

  </CardLight>
}
function NewItem({ onAdd, list }: { onAdd: (ck: CharacterKey) => void, list: CharacterKey[] }) {
  const { t } = useTranslation("page_character")
  const [show, onOpen, onClose] = useBoolState(false)
  const filter = useCallback((char?: ICachedCharacter) => {
    if (!char) return false
    return !list.includes(char.key)
  }, [list])
  return <>
    <CharacterSelectionModal show={show} onHide={onClose} onSelect={onAdd} filter={filter} />
    <Button fullWidth sx={{ height: itemSize }} color="info" onClick={onOpen} startIcon={<Add />} >
      <Trans t={t} i18nKey="tabOptimize.useEquipped.modal.add">Add character to list</Trans>
    </Button>
  </>
}
