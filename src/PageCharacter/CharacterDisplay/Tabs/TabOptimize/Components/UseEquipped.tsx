import { Add, CheckBox, CheckBoxOutlineBlank, Close, KeyboardArrowDown, KeyboardArrowUp, KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, Replay, Settings } from "@mui/icons-material";
import { Box, Button, ButtonGroup, CardContent, Divider, Grid, Typography } from "@mui/material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ArtifactCardPico from "../../../../../Components/Artifact/ArtifactCardPico";
import CardDark from "../../../../../Components/Card/CardDark";
import CardLight from "../../../../../Components/Card/CardLight";
import CharacterCardPico from "../../../../../Components/Character/CharacterCardPico";
import CloseButton from "../../../../../Components/CloseButton";
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from "../../../../../Components/CustomNumberInput";
import ModalWrapper from "../../../../../Components/ModalWrapper";
import SqBadge from "../../../../../Components/SqBadge";
import WeaponCardPico from "../../../../../Components/Weapon/WeaponCardPico";
import { CharacterContext } from "../../../../../Context/CharacterContext";
import { DatabaseContext } from "../../../../../Database/Database";
import useBoolState from "../../../../../ReactHooks/useBoolState";
import useCharacter from "../../../../../ReactHooks/useCharacter";
import useCharSelectionCallback from "../../../../../ReactHooks/useCharSelectionCallback";
import { ICachedCharacter } from "../../../../../Types/character";
import { CharacterKey } from "../../../../../Types/consts";
import { CharacterSelectionModal } from "../../../../CharacterSelectionModal";
import useBuildSetting from "../useBuildSetting";

export default function UseEquipped({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting: { useEquippedArts }, buildSettingDispatch } = useBuildSetting(characterKey)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState(false)
  const [{ equipmentPriority: tempEquipmentPriority }, setTO] = useState(database.displayOptimize.get())
  useEffect(() => database.displayOptimize.follow((r, to) => setTO(to)), [database, setTO])
  //Basic validate for the equipmentPrio list to remove dups and characters that doesnt exist.
  const equipmentPriority = useMemo(() => [...new Set(tempEquipmentPriority)].filter(ck => database.chars.get(ck)), [database, tempEquipmentPriority])
  const setPrio = useCallback((equipmentPriority: CharacterKey[]) => database.displayOptimize.set({ equipmentPriority }), [database])

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
    return database.chars.keys.length - 1 - numAbove
  }, [numAbove, database])
  const numUnlisted = useMemo(() => {
    return database.chars.keys.length - equipmentPriority.length
  }, [equipmentPriority, database])

  return <Box display="flex" gap={1}>
    <ModalWrapper open={show} onClose={onClose} containerProps={{ maxWidth: "sm" }}><CardDark>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item flexGrow={1}>
            <Typography variant="h6">{t`useEquipped.modal.title`}</Typography>
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
            <Typography gutterBottom><Trans t={t} i18nKey="useEquipped.modal.desc1">When generating a build, the Optimizer will only consider equipped artifacts from characters below the current character or those not on the list.</Trans></Typography>
            <Typography gutterBottom><Trans t={t} i18nKey="useEquipped.modal.desc2">If the current character is not on the list, the Optimizer will only consider equipped artifacts from others characters that are not on the list.</Trans></Typography>
          </CardContent>
        </CardLight>
        <Box display="flex" flexDirection="column" gap={2}>
          {equipmentPriority.map((ck, i) =>
            <SelectItem key={ck} characterKey={ck} rank={i + 1} maxRank={equipmentPriority.length} setRank={(num) => num && setPrioRank(i, num - 1)} onRemove={() => removePrio(i)} numAbove={numAbove} />)}
          <Box sx={{ display: "flex", gap: 1 }}>
            <NewItem onAdd={addPrio} list={equipmentPriority} />
            <Button color="error" onClick={resetPrio} startIcon={<Replay />}><Trans t={t} i18nKey="useEquipped.modal.clearList">Clear List</Trans></Button>
          </Box>
          {!!numUseEquippedChar && <SqBadge color="success"><Typography><Trans t={t} i18nKey="useEquipped.modal.usingNum" count={numUnlisted}>Using artifacts from <strong>{{ count: numUnlisted }}</strong> unlisted characters</Trans></Typography></SqBadge>}
        </Box>
      </CardContent>
    </CardDark ></ModalWrapper>
    <ButtonGroup sx={{ display: "flex", width: "100%" }}>
      <Button sx={{ flexGrow: 1 }} onClick={() => buildSettingDispatch({ useEquippedArts: !useEquippedArts })} disabled={disabled} startIcon={useEquippedArts ? <CheckBox /> : <CheckBoxOutlineBlank />} color={useEquippedArts ? "success" : "secondary"}>
        <Box>
          <span><Trans t={t} i18nKey="useEquipped.title">Use Equipped Artifacts</Trans></span>
          {useEquippedArts && <SqBadge><Trans t={t} i18nKey="useEquipped.usingNum" count={numUseEquippedChar}>Using from <strong>{{ count: numUseEquippedChar }}</strong> characters</Trans></SqBadge>}
        </Box>
      </Button>
      {useEquippedArts && <Button sx={{ flexShrink: 1 }} color="info" onClick={onOpen} disabled={disabled}><Settings /></Button>}
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
  const { t } = useTranslation("page_character_optimize")
  const { database } = useContext(DatabaseContext)
  const character = useCharacter(characterKey)
  const onClick = useCharSelectionCallback()
  if (!character) return null
  const { equippedWeapon, equippedArtifacts } = character
  return <CardLight sx={{ p: 1 }}  >
    <Box sx={{ pb: 1, display: "flex", justifyContent: "space-between", gap: 1 }}>
      <SqBadge color="info">
        <Typography>#{rank}</Typography>
      </SqBadge>
      <SqBadge sx={{ flexGrow: 1 }} color={numAbove === (rank - 1) ? "warning" : (rank - 1) < numAbove ? "error" : "success"}>
        <Typography>{numAbove === (rank - 1) ? <Trans t={t} i18nKey="useEquipped.modal.status.curr">Current character</Trans>
          : (rank - 1) < numAbove ? <Trans t={t} i18nKey="useEquipped.modal.status.dont">Don't Use artifacts</Trans> :
            <Trans t={t} i18nKey="useEquipped.modal.status.use">Use artifacts</Trans>}</Typography>
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
        <CharacterCardPico characterKey={characterKey} onClick={onClick} />
      </Grid>
      <Grid item xs={1}><WeaponCardPico weaponId={equippedWeapon} /></Grid>
      {Object.entries(equippedArtifacts).map(([slotKey, aId]) => <Grid item xs={1} key={slotKey} ><ArtifactCardPico slotKey={slotKey} artifactObj={database.arts.get(aId)} /></Grid>)}
    </Grid>

  </CardLight>
}
function NewItem({ onAdd, list }: { onAdd: (ck: CharacterKey) => void, list: CharacterKey[] }) {
  const { t } = useTranslation("page_character_optimize")
  const [show, onOpen, onClose] = useBoolState(false)
  const filter = useCallback((char?: ICachedCharacter) => {
    if (!char) return false
    return !list.includes(char.key)
  }, [list])
  return <>
    <CharacterSelectionModal show={show} onHide={onClose} onSelect={onAdd} filter={filter} />
    <Button fullWidth sx={{ height: itemSize }} color="info" onClick={onOpen} startIcon={<Add />} >
      <Trans t={t} i18nKey="useEquipped.modal.add">Add character to list</Trans>
    </Button>
  </>
}
