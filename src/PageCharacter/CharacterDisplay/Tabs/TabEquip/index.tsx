import { SwapHoriz } from '@mui/icons-material';
import { Box, Button, CardContent, Grid, useMediaQuery } from '@mui/material';
import { useTheme } from "@mui/system";
import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import SetEffectDisplay from '../../../../Components/Artifact/SetEffectDisplay';
import CardLight from '../../../../Components/Card/CardLight';
import StatDisplayComponent from '../../../../Components/Character/StatDisplayComponent';
import DocumentDisplay from "../../../../Components/DocumentDisplay";
import { ArtifactSheet } from '../../../../Data/Artifacts/ArtifactSheet';
import WeaponSheet from '../../../../Data/Weapons/WeaponSheet';
import { DatabaseContext } from '../../../../Database/Database';
import { DataContext } from '../../../../DataContext';
import { uiInput as input } from '../../../../Formula';
import ArtifactCard from '../../../../PageArtifact/ArtifactCard';
import WeaponCard from '../../../../PageWeapon/WeaponCard';
import useBoolState from '../../../../ReactHooks/useBoolState';
import useForceUpdate from '../../../../ReactHooks/useForceUpdate';
import usePromise from '../../../../ReactHooks/usePromise';
import { allSlotKeys, SlotKey } from '../../../../Types/consts';
import { objectKeyMap } from '../../../../Util/Util';
import ArtifactSwapModal from './ArtifactSwapModal';
import WeaponSwapModal from './WeaponSwapModal';

const WeaponEditor = lazy(() => import('../../../../PageWeapon/WeaponEditor'))

function TabEquip() {
  const { teamData, data, character, character: { equippedWeapon, key: characterKey }, mainStatAssumptionLevel } = useContext(DataContext)
  const { weaponSheet } = teamData[characterKey]!
  const [weaponId, setweaponId] = useState("")
  const showWeapon = useCallback(() => setweaponId(equippedWeapon), [equippedWeapon],)
  const hideWeapon = useCallback(() => setweaponId(""), [])

  //triggers when character swap weapons
  useEffect(() => {
    if (weaponId && weaponId !== equippedWeapon)
      setweaponId(equippedWeapon)
  }, [weaponId, equippedWeapon])

  const { database } = useContext(DatabaseContext)
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])

  // TODO: We can also listen only to equipped artifacts
  const [, updateArt] = useForceUpdate()
  useEffect(() => database.followAnyArt(updateArt))

  const unequipArts = useCallback(() => {
    if (!character) return
    if (!window.confirm("Do you want to move all currently equipped artifacts to inventory?")) return
    database.equipArtifacts(character.key, objectKeyMap(allSlotKeys, _ => ""))
  }, [character, database])
  const setEffects = useMemo(() => artifactSheets && ArtifactSheet.setEffects(artifactSheets, data), [artifactSheets, data])

  const theme = useTheme();
  const grxl = useMediaQuery(theme.breakpoints.up('xl'));
  const artifactFields = useMemo(() => artifactSheets && setEffects && Object.entries(setEffects).map(([setKey, setNumKeyArr]) =>
    <CardLight key={setKey} sx={{ flexGrow: 1, }} >
      <Button color="error" onClick={unequipArts} fullWidth sx={{ borderRadius: 0 }}>Unequip all artifacts</Button>
      <CardContent >
        <Grid container spacing={1} flexDirection="column" height="100%" >
          <Grid item display="flex" flexDirection="column" gap={2}>
            {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />)}
          </Grid>
        </Grid>
      </CardContent>
    </CardLight>), [artifactSheets, setEffects, unequipArts])
  const weaponDoc = useMemo(() => weaponSheet.document.length > 0 && <CardLight><CardContent><DocumentDisplay sections={weaponSheet.document} /></CardContent></CardLight>, [weaponSheet])
  return <Box display="flex" flexDirection="column" gap={1}>
    <Suspense fallback={false}>
      <WeaponEditor
        weaponId={weaponId}
        footer
        onClose={hideWeapon}
        extraButtons={<LargeWeaponSwapButton weaponSheet={weaponSheet} />}
      />
    </Suspense>
    <CardLight >
      <CardContent>
        <StatDisplayComponent />
      </CardContent>
    </CardLight>
    <Grid container spacing={1}>
      {grxl && <Grid item xs={12} md={12} xl={3} sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
        {weaponDoc}
        {artifactFields}
      </Grid>}
      <Grid item xs={12} md={12} xl={9} container spacing={1}>
        <Grid item xs={12} sm={6} md={4} display="flex" flexDirection="column" gap={1}>
          <WeaponCard weaponId={equippedWeapon} onEdit={showWeapon} canEquip extraButtons={<WeaponSwapButton weaponSheet={weaponSheet} />} />
        </Grid>
        {allSlotKeys.map(slotKey => <Grid item xs={12} sm={6} md={4} key={slotKey} >
          {!!data.get(input.art[slotKey].id).value ?
            <ArtifactCard artifactId={data.get(input.art[slotKey].id).value} mainStatAssumptionLevel={mainStatAssumptionLevel}
              extraButtons={<ArtifactSwapButton slotKey={slotKey} />} editor canEquip /> :
            <ArtSwapCard slotKey={slotKey} />}
        </Grid>)}
      </Grid>
      {!grxl && <Grid item xs={12} md={12} xl={3} container spacing={1} >
        <Grid item xs={12} md={6} lg={4}>{weaponDoc}</Grid>
        <Grid item xs={12} md={6} lg={4}>{artifactFields}</Grid>
      </Grid>}
    </Grid>
  </Box>
}
export default TabEquip
function ArtSwapCard({ slotKey }: { slotKey: SlotKey }) {
  const { character: { key: characterKey } } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <CardLight sx={{ height: "100%", width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>
    <Box sx={{
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
    >
      <ArtifactSwapModal slotKey={slotKey} show={show} onClose={onClose} onChangeId={id => database.setArtLocation(id, characterKey)} />
      <Button onClick={onOpen} color="info" sx={{ borderRadius: "1em", }}>
        <SwapHoriz sx={{ height: 100, width: 100 }} />
      </Button>
    </Box>
  </CardLight>
}
function WeaponSwapButton({ weaponSheet }: { weaponSheet: WeaponSheet }) {
  const { character: { key: characterKey } } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <>
    <Button color="info" size="small" onClick={onOpen} ><SwapHoriz /></Button>
    <WeaponSwapModal weaponTypeKey={weaponSheet.weaponType} onChangeId={id => database.setWeaponLocation(id, characterKey)} show={show} onClose={onClose} />
  </>
}
function LargeWeaponSwapButton({ weaponSheet }: { weaponSheet: WeaponSheet }) {
  const { character: { key: characterKey } } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <>
    <Button color="info" onClick={onOpen} startIcon={<SwapHoriz />} >SWAP WEAPON</Button>
    <WeaponSwapModal weaponTypeKey={weaponSheet.weaponType} onChangeId={id => database.setWeaponLocation(id, characterKey)} show={show} onClose={onClose} />
  </>
}
function ArtifactSwapButton({ slotKey }: { slotKey: SlotKey }) {
  const { character: { key: characterKey } } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <>
    <Button color="info" size="small" onClick={onOpen} ><SwapHoriz /></Button>
    <ArtifactSwapModal slotKey={slotKey} show={show} onClose={onClose} onChangeId={id => database.setArtLocation(id, characterKey)} />
  </>
}
