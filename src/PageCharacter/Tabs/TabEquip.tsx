import { Box, Button, Card, CardContent, Divider, Grid, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from "@mui/system";
import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import SetEffectDisplay from '../../Components/Artifact/SetEffectDisplay';
import CardLight from '../../Components/Card/CardLight';
import StatDisplayComponent from '../../Components/Character/StatDisplayComponent';
import DocumentDisplay from "../../Components/DocumentDisplay";
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../../Database/Database';
import { DataContext } from '../../DataContext';
import { uiInput as input } from '../../Formula';
import ArtifactCard from '../../PageArtifact/ArtifactCard';
import WeaponCard from '../../PageWeapon/WeaponCard';
import WeaponSwapBtn from '../../PageWeapon/WeaponSwapBtn';
import useForceUpdate from '../../ReactHooks/useForceUpdate';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys } from '../../Types/consts';
import { objectKeyMap } from '../../Util/Util';

const WeaponDisplayCard = lazy(() => import('../../PageWeapon/WeaponDisplayCard'))

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
  const artIds = allSlotKeys.map(slotKey => data.get(input.art[slotKey].id).value)
  const setEffects = useMemo(() => artifactSheets && ArtifactSheet.setEffects(artifactSheets, data), [artifactSheets, data])

  const theme = useTheme();
  const grxl = useMediaQuery(theme.breakpoints.up('xl'));
  const artifactFields = useMemo(() => artifactSheets && setEffects && Object.entries(setEffects).map(([setKey, setNumKeyArr]) =>
    <CardLight key={setKey} sx={{ flexGrow: 1, }} >
      <CardContent >
        <Grid container spacing={1} flexDirection="column" height="100%" >
          <Grid item display="flex" flexDirection="column" gap={2}>
            {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />)}
          </Grid>
        </Grid>
      </CardContent>
    </CardLight>), [artifactSheets, setEffects])
  const weaponDoc = useMemo(() => weaponSheet.document.length > 0 && <CardLight><CardContent><DocumentDisplay sections={weaponSheet.document} /></CardContent></CardLight>, [weaponSheet])
  return <Box display="flex" flexDirection="column" gap={1}>
    <Suspense fallback={false}>
      <WeaponDisplayCard
        weaponId={weaponId}
        footer
        onClose={hideWeapon}
      />
    </Suspense>
    <CardLight >
      <CardContent>
        <StatDisplayComponent />
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container spacing={1}>
          <Grid item>
            <WeaponSwapBtn weaponTypeKey={weaponSheet.weaponType} onChangeId={id => database.setWeaponLocation(id, characterKey)} />
          </Grid>
          <Grid item>
            <Button color="error" onClick={unequipArts}>Unequip all artifacts</Button>
          </Grid>
          <Grid item flexGrow={1}></Grid>
          <Grid item>{!!mainStatAssumptionLevel && <Card sx={{ p: 1, bgcolor: t => t.palette.warning.dark }}><Typography><strong>Assume Main Stats are Level {mainStatAssumptionLevel}</strong></Typography></Card>}</Grid>
        </Grid>
      </CardContent>
    </CardLight>
    <Grid container spacing={1}>
      {grxl && <Grid item xs={12} md={12} xl={3} sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
        {weaponDoc}
        {artifactFields}
      </Grid>}
      <Grid item xs={12} md={12} xl={9} container spacing={1}>
        <Grid item xs={12} sm={6} md={4} display="flex" flexDirection="column" gap={1}>
          <WeaponCard weaponId={equippedWeapon} onEdit={showWeapon} canEquip />
        </Grid>
        {artIds.map(id => !!id && <Grid item xs={12} sm={6} md={4} key={id} >
          <ArtifactCard artifactId={id} mainStatAssumptionLevel={mainStatAssumptionLevel} />
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
