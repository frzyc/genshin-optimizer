import { CardActionArea, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import React, { Suspense, useContext } from 'react';
import { artifactSlotIcon } from '../../Artifact/Component/SlotNameWIthIcon';
import StatDisplayComponent from '../../Character/CharacterDisplay/StatDisplayComponent';
import CardLight from '../../Components/Card/CardLight';
import SqBadge from '../../Components/SqBadge';
import { DatabaseContext } from '../../Database/Database';
import { Sheets } from '../../ReactHooks/useSheets';
import { allSlotKeys, ArtifactSetKey, CharacterKey, SlotKey } from '../../Types/consts';
import { ICalculatedStats } from '../../Types/stats';

type ArtifactBuildDisplayItemProps = {
  sheets: Sheets,
  index: number,
  characterKey: CharacterKey,
  build: ICalculatedStats,
  statsDisplayKeys: any,
  onClick: () => void,
  disabled?: boolean
}
//for displaying each artifact build
export default function ArtifactBuildDisplayItem({ sheets, sheets: { artifactSheets }, index, characterKey, build, statsDisplayKeys, onClick, disabled }: ArtifactBuildDisplayItemProps) {
  const database = useContext(DatabaseContext)
  const character = database._getChar(characterKey)
  if (!character) return null
  const { equippedArtifacts } = character
  const currentlyEquipped = allSlotKeys.every(slotKey => equippedArtifacts[slotKey] === build.equippedArtifacts?.[slotKey])
  return <CardLight>
    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
      <CardActionArea onClick={onClick} disabled={disabled}>
        <CardContent>
          <Grid container spacing={1} sx={{ pb: 1 }}>
            <Grid item>
              <Typography variant="h6"><SqBadge color="info"><strong>#{index + 1}{currentlyEquipped ? " (Equipped)" : ""}</strong></SqBadge></Typography>
            </Grid>
            {(Object.entries(build.setToSlots) as [ArtifactSetKey, SlotKey[]][]).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
              <Grid item key={key}><Typography variant="h6"><SqBadge color={currentlyEquipped ? "success" : "primary"} >
                {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheets?.[key].name ?? ""}
              </SqBadge></Typography></Grid>
            )}
          </Grid>
          <StatDisplayComponent {...{ sheets, character, equippedBuild: build, statsDisplayKeys }} />
        </CardContent>
      </CardActionArea>
    </Suspense>
  </CardLight>
}