import { CardContent, Divider, Grid, Typography } from '@mui/material';
import React from 'react';
import CardLight from '../../Components/Card/CardLight';
import { HitModeToggle, InfusionAuraDropdown, ReactionToggle } from '../../Components/HitModeEditor';
export default function HitModeCard({ disabled }: { disabled: boolean }) {
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Grid container>
        <Grid item flexGrow={1}><Typography>Hit Mode Options</Typography></Grid>
        <Grid item ><InfusionAuraDropdown size="small" disabled={disabled} /></Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent >
      <HitModeToggle fullWidth size="small" disabled={disabled} />
      <ReactionToggle fullWidth size="small" disabled={disabled} sx={{ mt: 1 }} />
    </CardContent>
  </CardLight >
}
