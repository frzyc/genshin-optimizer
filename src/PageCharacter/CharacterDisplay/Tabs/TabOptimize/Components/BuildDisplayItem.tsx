import { ChevronRight } from '@mui/icons-material';
import { Button, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ArtifactSlotKey } from 'pipeline';
import { Suspense, useCallback, useContext, useMemo, useState } from 'react';
import ArtifactCardNano from '../../../../../Components/Artifact/ArtifactCardNano';
import ArtifactSetTooltip from '../../../../../Components/Artifact/ArtifactSetTooltip';
import { artifactSlotIcon } from '../../../../../Components/Artifact/SlotNameWIthIcon';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import StatDisplayComponent from '../../../../../Components/Character/StatDisplayComponent';
import ModalWrapper from '../../../../../Components/ModalWrapper';
import SqBadge from '../../../../../Components/SqBadge';
import WeaponCardNano from '../../../../../Components/Weapon/WeaponCardNano';
import { CharacterContext } from '../../../../../Context/CharacterContext';
import { DataContext } from '../../../../../Context/DataContext';
import { ArtifactSheet } from '../../../../../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../../../../../Database/Database';
import { uiInput as input } from '../../../../../Formula';
import ArtifactCard from '../../../../../PageArtifact/ArtifactCard';
import usePromise from '../../../../../ReactHooks/usePromise';
import { allSlotKeys, ArtifactSetKey, charKeyToLocCharKey, SlotKey } from '../../../../../Types/consts';
import useBuildSetting from '../useBuildSetting';

type NewOld = {
  newId: string,
  oldId?: string
}

type BuildDisplayItemProps = {
  index?: number,
  compareBuild: boolean,
  disabled?: boolean,
  extraButtons?: JSX.Element
}
//for displaying each artifact build
export default function BuildDisplayItem({ index, compareBuild, extraButtons, disabled }: BuildDisplayItemProps) {
  const { character: { key: characterKey, equippedArtifacts } } = useContext(CharacterContext)
  const { buildSetting: { mainStatAssumptionLevel } } = useBuildSetting(characterKey)
  const { database } = useContext(DatabaseContext)
  const dataContext = useContext(DataContext)

  const { data, oldData } = dataContext
  const [newOld, setNewOld] = useState(undefined as NewOld | undefined)
  const close = useCallback(() => setNewOld(undefined), [setNewOld],)

  const equipBuild = useCallback(() => {
    if (!window.confirm("Do you want to equip this build to this character?")) return
    allSlotKeys.forEach(s => {
      const aid = data.get(input.art[s].id).value
      if (aid) database.arts.set(aid, { location: charKeyToLocCharKey(characterKey) })
    })
    database.weapons.set(data.get(input.weapon.id).value!, { location: charKeyToLocCharKey(characterKey) })
  }, [characterKey, data, database])

  const statProviderContext = useMemo(() => {
    const dataContext_ = { ...dataContext }
    if (!compareBuild) dataContext_.oldData = undefined
    return dataContext_
  }, [dataContext, compareBuild])

  // Memoize Arts because of its dynamic onClick
  const artNanos = useMemo(() => allSlotKeys.map(slotKey =>
    <Grid item xs={1} key={slotKey} >
      <ArtifactCardNano showLocation slotKey={slotKey} artifactId={data.get(input.art[slotKey].id).value} mainStatAssumptionLevel={mainStatAssumptionLevel} onClick={() => {
        const oldId = equippedArtifacts[slotKey]
        const newId = data.get(input.art[slotKey].id).value!
        setNewOld({ oldId: oldId !== newId ? oldId : undefined, newId })
      }} />
    </Grid>), [data, setNewOld, equippedArtifacts, mainStatAssumptionLevel])

  if (!oldData) return null
  const currentlyEquipped = allSlotKeys.every(slotKey => data.get(input.art[slotKey].id).value === oldData.get(input.art[slotKey].id).value) && data.get(input.weapon.id).value === oldData.get(input.weapon.id).value

  return <CardLight>
    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
      {newOld && <CompareArtifactModal newOld={newOld} mainStatAssumptionLevel={mainStatAssumptionLevel} onClose={close} />}
      <CardContent>
        <Box display="flex" gap={1} sx={{ pb: 1 }} flexWrap="wrap">
          {index !== undefined && <SqBadge color="info"><Typography><strong>#{index + 1}{currentlyEquipped ? " (Equipped)" : ""}</strong></Typography></SqBadge>}
          <SetBadges currentlyEquipped={currentlyEquipped} />
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          </Box>
          <Button size='small' color="success" onClick={equipBuild} disabled={disabled || currentlyEquipped}>Equip Build</Button>
          {extraButtons}
        </Box>
        <Grid container spacing={1} sx={{ pb: 1 }} columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}>
          <Grid item xs={1}>
            <WeaponCardNano showLocation weaponId={data.get(input.weapon.id).value} />
          </Grid>
          {artNanos}
        </Grid>
        <DataContext.Provider value={statProviderContext}>
          <StatDisplayComponent />
        </DataContext.Provider>
      </CardContent>
    </Suspense>
  </CardLight>
}
function SetBadges({ currentlyEquipped = false }: { currentlyEquipped: boolean }) {
  const { data } = useContext(DataContext)
  const setToSlots: Partial<Record<ArtifactSetKey, SlotKey[]>> = {}
  allSlotKeys.forEach(slotKey => {
    const set = data.get(input.art[slotKey].set).value as ArtifactSetKey | undefined
    if (!set) return
    if (setToSlots[set]) setToSlots[set]!.push(slotKey)
    else setToSlots[set] = [slotKey]
  })
  return <>{Object.entries(setToSlots).sort(([k1, slotarr1], [k2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
    <SetBadge key={key} setKey={key} currentlyEquipped={currentlyEquipped} slotarr={slotarr} />
  )}</>

}
function SetBadge({ setKey, currentlyEquipped = false, slotarr }: { setKey: ArtifactSetKey, currentlyEquipped: boolean, slotarr: ArtifactSlotKey[] }) {
  const artifactSheet = usePromise(() => ArtifactSheet.get(setKey), [])
  if (!artifactSheet) return null
  const numInSet = slotarr.length
  const setActive = Object.keys(artifactSheet.setEffects).map((setKey) => parseInt(setKey)).filter(setNum => setNum <= numInSet)
  return <Box>
    <ArtifactSetTooltip artifactSheet={artifactSheet} numInSet={numInSet} >
      <SqBadge color={currentlyEquipped ? "success" : "primary"} ><Typography >
        {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheet.name ?? ""}
        {setActive.map(n => <SqBadge sx={{ ml: 0.5 }} key={n} color="success">{n}</SqBadge>)}
      </Typography></SqBadge>
    </ArtifactSetTooltip>
  </Box>
}

function CompareArtifactModal({ newOld: { newId, oldId }, mainStatAssumptionLevel, onClose }: { newOld: NewOld, mainStatAssumptionLevel: number, onClose: () => void }) {
  const { database } = useContext(DatabaseContext)
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const onEquip = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact to this character?")) return
    database.arts.set(newId, { location: charKeyToLocCharKey(characterKey) })
    onClose()
  }, [newId, database, characterKey, onClose])

  return <ModalWrapper open={!!newId} onClose={onClose} containerProps={{ maxWidth: oldId ? "md" : "xs" }}>
    <CardDark>
      <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: 2, height: "100%" }}>
        {oldId && <Box minWidth={320}><ArtifactCard artifactId={oldId} mainStatAssumptionLevel={mainStatAssumptionLevel} canExclude canEquip /></Box>}
        {oldId && <Box display="flex" flexGrow={1} />}
        {oldId && <Box display="flex" alignItems="center" justifyContent="center"><Button onClick={onEquip} sx={{ display: "flex" }}><ChevronRight sx={{ fontSize: 40 }} /></Button></Box>}
        {oldId && <Box display="flex" flexGrow={1} />}
        <Box minWidth={320}><ArtifactCard artifactId={newId} mainStatAssumptionLevel={mainStatAssumptionLevel} canExclude canEquip /></Box>
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
