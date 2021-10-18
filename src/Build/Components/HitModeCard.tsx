import { CardContent, Divider, Grid, Typography } from '@mui/material';
import React from 'react';
import CardLight from '../../Components/Card/CardLight';
import { HitModeToggle, InfusionAuraDropdown, ReactionToggle } from '../../Components/HitModeEditor';
import { ICachedCharacter } from '../../Types/character';
import { ICalculatedStats } from '../../Types/stats';
export default function HitModeCard({ character, build, disabled }: { character: ICachedCharacter, build: ICalculatedStats, disabled: boolean }) {
  if (!character) return null
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Grid container>
        <Grid item flexGrow={1}><Typography>Hit Mode Options</Typography></Grid>
        <Grid item ><InfusionAuraDropdown size="small" character={character} disabled={disabled} /></Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent >
      <HitModeToggle fullWidth size="small" character={character} disabled={disabled} />
      <ReactionToggle fullWidth size="small" build={build} character={character} disabled={disabled} sx={{ mt: 1 }} />
    </CardContent>
  </CardLight >
}