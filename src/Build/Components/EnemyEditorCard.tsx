import { ExpandMore } from '@mui/icons-material';
import { CardContent, CardHeader, Collapse, Divider, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import Character from '../../Character/Character';
import CardLight from '../../Components/Card/CardLight';
import { EnemyEditor, EnemyResText } from '../../Components/EnemyEditor';
import ExpandButton from '../../Components/ExpandButton';
import Stat from '../../Stat';
import { ICachedCharacter } from '../../Types/character';
import { allElements } from '../../Types/consts';

export default function EnemyEditorCard({ character }: {
  character: ICachedCharacter
}) {
  const [expanded, setExpanded] = useState(false);
  return <CardLight>
    <CardHeader
      action={
        <ExpandButton
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
          size="small"
        >
          <ExpandMore />
        </ExpandButton>
      }
      title={<Typography>
        {Stat.getStatName("enemyLevel")} <strong>{Character.getStatValueWithBonus(character, "enemyLevel")}</strong>
      </Typography>}
    />
    <Divider />
    <CardContent>
      <Grid container spacing={1}>
        {["physical", ...allElements].map(element => <Grid item xs={3} key={element}><EnemyResText element={element} character={character} /></Grid>)}
        <Grid item xs={4} ><Typography>DEF Reduction {Character.getStatValueWithBonus(character, "enemyDEFRed_")}%</Typography></Grid>
      </Grid>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        <EnemyEditor character={character} bsProps={{ xs: 12 }} />
      </CardContent>
    </Collapse>
  </CardLight>
}