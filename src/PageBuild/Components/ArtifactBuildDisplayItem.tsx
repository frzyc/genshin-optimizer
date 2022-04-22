import { ChevronRight } from '@mui/icons-material';
import { Button, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { Suspense, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtifactCardNano from '../../Components/Artifact/ArtifactCardNano';
import { artifactSlotIcon } from '../../Components/Artifact/SlotNameWIthIcon';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import StatDisplayComponent from '../../Components/Character/StatDisplayComponent';
import ModalWrapper from '../../Components/ModalWrapper';
import SqBadge from '../../Components/SqBadge';
import WeaponCardNano from '../../Components/Weapon/WeaponCardNano';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../../Database/Database';
import { DataContext } from '../../DataContext';
import { uiInput as input } from '../../Formula';
import ArtifactCard from '../../PageArtifact/ArtifactCard';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys, ArtifactSetKey, SlotKey } from '../../Types/consts';
import { ArtifactDisplayLocationState } from '../../Types/LocationState';

type NewOld = {
  newId: string,
  oldId?: string
}

type ArtifactBuildDisplayItemProps = {
  index: number,
  compareBuild: boolean,
  disabled?: boolean,
}
//for displaying each artifact build
export default function ArtifactBuildDisplayItem({ index, compareBuild, disabled }: ArtifactBuildDisplayItemProps) {
  const { database } = useContext(DatabaseContext)
  const dataContext = useContext(DataContext)

  const { character, data, oldData, mainStatAssumptionLevel } = dataContext
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const [newOld, setNewOld] = useState(undefined as NewOld | undefined)
  const close = useCallback(() => setNewOld(undefined), [setNewOld],)

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    const newBuild = Object.fromEntries(allSlotKeys.map(s => [s, data.get(input.art[s].id).value])) as Record<SlotKey, string>
    database.equipArtifacts(character.key, newBuild)
  }, [character, data, database])
  if (!character || !artifactSheets || !oldData) return null
  const currentlyEquipped = allSlotKeys.every(slotKey => data.get(input.art[slotKey].id).value === oldData.get(input.art[slotKey].id).value)
  const statProviderContext = { ...dataContext }
  if (!compareBuild) statProviderContext.oldData = undefined
  const setToSlots: Partial<Record<ArtifactSetKey, SlotKey[]>> = {}
  allSlotKeys.forEach(slotKey => {
    const set = data.get(input.art[slotKey].set).value as ArtifactSetKey | undefined
    if (!set) return
    if (setToSlots[set]) setToSlots[set]!.push(slotKey)
    else setToSlots[set] = [slotKey]
  })

  return <CardLight>
    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
      {newOld && <CompareArtifactModal newOld={newOld} mainStatAssumptionLevel={mainStatAssumptionLevel} onClose={close} />}
      <CardContent>
        <Box display="flex" gap={1} sx={{ pb: 1 }} flexWrap="wrap">
          <Typography variant="h6"><SqBadge color="info"><strong>#{index + 1}{currentlyEquipped ? " (Equipped)" : ""}</strong></SqBadge></Typography>
          {(Object.entries(setToSlots) as [ArtifactSetKey, SlotKey[]][]).sort(([k1, slotarr1], [k2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
            <Box key={key}><Typography variant="h6"><SqBadge color={currentlyEquipped ? "success" : "primary"} >
              {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheets?.[key].name ?? ""}
            </SqBadge></Typography></Box>
          )}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          </Box>
          <Button size='small' color="success" onClick={equipArts} disabled={disabled || currentlyEquipped}>Equip Artifacts</Button>
        </Box>
        <Grid container spacing={1} sx={{ pb: 1 }}>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <WeaponCardNano weaponId={character.equippedWeapon} />
          </Grid>
          {allSlotKeys.map(slotKey =>
            <Grid item xs={6} sm={4} md={3} lg={2} key={slotKey} >
              <ArtifactCardNano showLocation slotKey={slotKey} artifactId={data.get(input.art[slotKey].id).value} mainStatAssumptionLevel={mainStatAssumptionLevel} onClick={() => {
                const oldId = character.equippedArtifacts[slotKey]
                const newId = data.get(input.art[slotKey].id).value!
                setNewOld({ oldId: oldId !== newId ? oldId : undefined, newId })
              }} />
            </Grid>)}
        </Grid>
        <DataContext.Provider value={statProviderContext}>
          <StatDisplayComponent />
        </DataContext.Provider>
      </CardContent>
    </Suspense>
  </CardLight>
}

function CompareArtifactModal({ newOld: { newId, oldId }, mainStatAssumptionLevel, onClose }: { newOld: NewOld, mainStatAssumptionLevel: number, onClose: () => void }) {
  const navigate = useNavigate()
  // TODO: artifact editor instead of going to artifact page. idealy fold ArtifactEditor to ArtifactCard
  const edit = useCallback(
    artid => navigate("/artifact", {
      state: {
        artToEditId: artid
      } as ArtifactDisplayLocationState
    }), [navigate])
  return <ModalWrapper open={!!newId} onClose={onClose} containerProps={{ maxWidth: oldId ? "md" : "xs" }}>
    <CardDark>
      <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: 2, height: "100%" }}>
        {oldId && <Box><ArtifactCard artifactId={oldId} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={edit} /></Box>}
        {oldId && <Box display="flex" flexGrow={1} />}
        {oldId && <Box display="flex" alignItems="center"><CardLight sx={{ display: "flex" }}><ChevronRight sx={{ fontSize: 40 }} /></CardLight></Box>}
        {oldId && <Box display="flex" flexGrow={1} />}
        <Box><ArtifactCard artifactId={newId} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={edit} /></Box>
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
