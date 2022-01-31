import { CardContent, Divider, ListItem, Typography } from '@mui/material';
import React, { useContext } from 'react';
import CardLight from '../../Components/Card/CardLight';
import { FieldDisplayList, NodeFieldDisplay } from '../../Components/FieldDisplay';
import { DataContext } from '../../DataContext';
import { input } from '../../Formula';
import { NumNode } from '../../Formula/type';
export default function TeamBuffCard() {
  const { data, oldData, character } = useContext(DataContext)
  const bonusStatsKeys = Object.keys(character?.bonusStats)
  if (!bonusStatsKeys.length) return null
  const nodes = bonusStatsKeys.map(k => data.get(input.total[k] as NumNode))
  const oldValues = oldData && bonusStatsKeys.map(k => oldData.get(input.total[k] as NumNode).value)
  if (!nodes.length) return null
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography>Team buff Stats</Typography>
    </CardContent>
    <Divider />
    <CardContent>
      {/* TODO: */}
      This isnt team buffs, but bonusStats. so... TODO
      <FieldDisplayList sx={{ my: 0 }} >
        {nodes.map((n, i) => <ListItem key={i}><NodeFieldDisplay node={n} oldValue={oldValues?.[i]} /></ListItem>)}
      </FieldDisplayList>
    </CardContent>
  </CardLight>
}
