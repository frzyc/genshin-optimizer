import { Checkroom, ChevronRight } from '@mui/icons-material';
import { Button, CardContent, Grid, Skeleton, Typography, Box } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo, useState } from 'react';
import ArtifactCardNano from '../../../../../Components/Artifact/ArtifactCardNano';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import StatDisplayComponent from '../../../../../Components/Character/StatDisplayComponent';
import ModalWrapper from '../../../../../Components/ModalWrapper';
import SqBadge from '../../../../../Components/SqBadge';
import WeaponCardNano from '../../../../../Components/Weapon/WeaponCardNano';
import { CharacterContext } from '../../../../../Context/CharacterContext';
import { DataContext } from '../../../../../Context/DataContext';
import { DatabaseContext } from '../../../../../Database/Database';
import { uiInput as input } from '../../../../../Formula';
import ArtifactCard from '../../../../../PageArtifact/ArtifactCard';
import { ICachedArtifact } from '../../../../../Types/artifact';
import { allSlotKeys, charKeyToLocCharKey } from '../../../../../Types/consts';
import useBuildSetting from '../useBuildSetting';
import { ArtifactSetBadges } from './ArtifactSetBadges';

type NewOld = {
  newId: string,
  oldId?: string
}

type BuildDisplayItemProps = {
  label?: Displayable,
  compareBuild: boolean,
  disabled?: boolean,
  extraButtonsRight?: JSX.Element,
  extraButtonsLeft?: JSX.Element,
}
//for displaying each artifact build
export default function BuildDisplayItem({ label, compareBuild, extraButtonsRight, extraButtonsLeft, disabled }: BuildDisplayItemProps) {
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

  const artifactIdsBySlot = useMemo(() => Object.fromEntries(allSlotKeys.map(slotKey => [
    slotKey,
    data.get(input.art[slotKey].id).value
  ])), [data])
  const artifacts = useMemo(() => artifactIdsBySlot && Object.values(artifactIdsBySlot)
    .map((artiId: string) => database.arts.get(artiId))
    .filter(arti => arti) as ICachedArtifact[],
    [artifactIdsBySlot, database.arts]
  )

  // Memoize Arts because of its dynamic onClick
  const artNanos = useMemo(() => allSlotKeys.map(slotKey =>
    <Grid item xs={1} key={slotKey} >
      <ArtifactCardNano showLocation slotKey={slotKey} artifactId={artifactIdsBySlot[slotKey]} mainStatAssumptionLevel={mainStatAssumptionLevel} onClick={() => {
        const oldId = equippedArtifacts[slotKey]
        const newId = artifactIdsBySlot[slotKey]!
        setNewOld({ oldId: oldId !== newId ? oldId : undefined, newId })
      }} />
    </Grid>), [setNewOld, equippedArtifacts, mainStatAssumptionLevel, artifactIdsBySlot])

  if (!oldData) return null
  const currentlyEquipped = allSlotKeys.every(slotKey => artifactIdsBySlot[slotKey] === oldData.get(input.art[slotKey].id).value) && data.get(input.weapon.id).value === oldData.get(input.weapon.id).value

  return <CardLight>
    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
      {newOld && <CompareArtifactModal newOld={newOld} mainStatAssumptionLevel={mainStatAssumptionLevel} onClose={close} />}
      <CardContent>
        <Box display="flex" gap={1} sx={{ pb: 1 }} flexWrap="wrap">
          {label !== undefined && <SqBadge color="info"><Typography><strong>{label}{currentlyEquipped ? " (Equipped)" : ""}</strong></Typography></SqBadge>}
          <ArtifactSetBadges artifacts={artifacts} currentlyEquipped={currentlyEquipped} />
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          </Box>
          {extraButtonsLeft}
          <Button size='small' color="success" onClick={equipBuild} disabled={disabled || currentlyEquipped} startIcon={<Checkroom />}>Equip Build</Button>
          {extraButtonsRight}
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
        {oldId && <Box minWidth={320}><ArtifactCard artifactId={oldId} mainStatAssumptionLevel={mainStatAssumptionLevel} canExclude canEquip editorProps={{ disableSet: true, disableSlot: true }} /></Box>}
        {oldId && <Box display="flex" flexGrow={1} />}
        {oldId && <Box display="flex" alignItems="center" justifyContent="center"><Button onClick={onEquip} sx={{ display: "flex" }}><ChevronRight sx={{ fontSize: 40 }} /></Button></Box>}
        {oldId && <Box display="flex" flexGrow={1} />}
        <Box minWidth={320}><ArtifactCard artifactId={newId} mainStatAssumptionLevel={mainStatAssumptionLevel} canExclude canEquip editorProps={{ disableSet: true, disableSlot: true }} /></Box>
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
