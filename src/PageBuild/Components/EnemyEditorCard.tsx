import { ExpandMore } from '@mui/icons-material';
import { CardContent, CardHeader, Collapse, Divider, Grid, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import CardLight from '../../Components/Card/CardLight';
import { EnemyEditor, EnemyResText } from '../../Components/EnemyEditor';
import ExpandButton from '../../Components/ExpandButton';
import { DataContext } from '../../DataContext';
import { input } from '../../Formula/index';
import { valueString } from '../../Formula/uiData';
import KeyMap from '../../KeyMap';
import { allElementsWithPhy } from '../../Types/consts';

export default function EnemyEditorCard() {
  const [expanded, setExpanded] = useState(false);
  const { data } = useContext(DataContext)
  const eLvlNode = data.get(input.enemy.level)
  const eDefRed = data.get(input.enemy.defRed)
  const eDefIgn = data.get(input.enemy.defIgn)
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
        {KeyMap.get(eLvlNode.key)} <strong>{valueString(eLvlNode.value, eLvlNode.unit, 0)}</strong>
      </Typography>}
    />
    <Divider />
    <CardContent>
      <Grid container spacing={1}>
        {allElementsWithPhy.map(element => <Grid item xs={3} key={element}><EnemyResText element={element} /></Grid>)}
        <Grid item xs={4} ><Typography>DEF Reduction {valueString(eDefRed.value, eDefRed.unit)}</Typography></Grid>
        <Grid item xs={4} ><Typography>DEF Reduction {valueString(eDefIgn.value, eDefIgn.unit)}</Typography></Grid>
      </Grid>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        <EnemyEditor bsProps={{ xs: 12 }} />
      </CardContent>
    </Collapse>
  </CardLight>
}
