import { Button, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { Suspense, useCallback, useContext } from 'react';
import ArtifactCardNano from '../../Components/Artifact/ArtifactCardNano';
import { artifactSlotIcon } from '../../Components/Artifact/SlotNameWIthIcon';
import CardLight from '../../Components/Card/CardLight';
import StatDisplayComponent from '../../Components/Character/StatDisplayComponent';
import SqBadge from '../../Components/SqBadge';
import WeaponCardNano from '../../Components/Weapon/WeaponCardNano';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../../Database/Database';
import { DataContext } from '../../DataContext';
import { uiInput as input } from '../../Formula';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys, ArtifactSetKey, SlotKey } from '../../Types/consts';

type ArtifactBuildDisplayItemProps = {
  index: number,
  compareBuild: boolean,
  disabled?: boolean
}
//for displaying each artifact build
export default function ArtifactBuildDisplayItem({ index, compareBuild, disabled }: ArtifactBuildDisplayItemProps) {
  const { database } = useContext(DatabaseContext)
  const dataContext = useContext(DataContext)
  const { character, data, oldData } = dataContext
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
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
      <CardContent>
        <Box display="flex" gap={1} sx={{ pb: 1 }}>
          <Typography variant="h6"><SqBadge color="info"><strong>#{index + 1}{currentlyEquipped ? " (Equipped)" : ""}</strong></SqBadge></Typography>
          {(Object.entries(setToSlots) as [ArtifactSetKey, SlotKey[]][]).sort(([k1, slotarr1], [k2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
            <Box key={key}><Typography variant="h6"><SqBadge color={currentlyEquipped ? "success" : "primary"} >
              {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheets?.[key].name ?? ""}
            </SqBadge></Typography></Box>
          )}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button size='small' color="success" onClick={equipArts} disabled={disabled || currentlyEquipped}>Equip Artifacts</Button>
          </Box>
        </Box>
        <Grid container spacing={1} sx={{ pb: 1 }}>
          {allSlotKeys.map(slotKey =>
            <Grid item xs={6} sm={4} md={3} lg={2} >
              <ArtifactCardNano artifactId={data.get(input.art[slotKey].id).value} />
            </Grid>)}
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <WeaponCardNano weaponId={character.equippedWeapon} />
          </Grid>
        </Grid>
        <DataContext.Provider value={statProviderContext}>
          <StatDisplayComponent />
        </DataContext.Provider>
      </CardContent>
    </Suspense>
  </CardLight>
}
