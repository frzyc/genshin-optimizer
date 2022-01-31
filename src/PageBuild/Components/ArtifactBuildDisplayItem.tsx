import { CardActionArea, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import React, { Suspense, useContext } from 'react';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import CardLight from '../../Components/Card/CardLight';
import SqBadge from '../../Components/SqBadge';
import { DataContext } from '../../DataContext';
import { input } from '../../Formula';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys, ArtifactSetKey, SlotKey } from '../../Types/consts';
import { artifactSlotIcon } from '../../Components/Artifact/SlotNameWIthIcon';
import StatDisplayComponent from '../../Components/Character/StatDisplayComponent';

type ArtifactBuildDisplayItemProps = {
  index: number,
  onClick: () => void,
  compareBuild: boolean,
  disabled?: boolean
}
//for displaying each artifact build
export default function ArtifactBuildDisplayItem({ index, onClick, compareBuild, disabled }: ArtifactBuildDisplayItemProps) {
  const dataContext = useContext(DataContext)
  const { character, data, oldData } = dataContext
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
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
      <CardActionArea onClick={onClick} disabled={disabled}>
        <CardContent>
          <Grid container spacing={1} sx={{ pb: 1 }}>
            <Grid item>
              <Typography variant="h6"><SqBadge color="info"><strong>#{index + 1}{currentlyEquipped ? " (Equipped)" : ""}</strong></SqBadge></Typography>
            </Grid>
            {(Object.entries(setToSlots) as [ArtifactSetKey, SlotKey[]][]).sort(([k1, slotarr1], [k2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
              <Grid item key={key}><Typography variant="h6"><SqBadge color={currentlyEquipped ? "success" : "primary"} >
                {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheets?.[key].name ?? ""}
              </SqBadge></Typography></Grid>
            )}
          </Grid>
          <DataContext.Provider value={statProviderContext}>
            <StatDisplayComponent />
          </DataContext.Provider>
        </CardContent>
      </CardActionArea>
    </Suspense>
  </CardLight>
}
