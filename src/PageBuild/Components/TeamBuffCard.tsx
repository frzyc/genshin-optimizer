import { CardContent, Divider, ListItem, Typography } from '@mui/material';
import React, { useContext } from 'react';
import CardLight from '../../Components/Card/CardLight';
import { FieldDisplayList, NodeFieldDisplay } from '../../Components/FieldDisplay';
import { DataContext } from '../../DataContext';
import { NodeDisplay } from '../../Formula/uiData';
export default function TeamBuffCard() {
  const { data } = useContext(DataContext)
  const teamBuffs = data.getTeamBuff()
  const nodes: Array<NodeDisplay<number>> = []
  Object.values(teamBuffs.total ?? {}).forEach(node => !node.isEmpty && nodes.push(node))
  Object.values(teamBuffs.premod ?? {}).forEach(node => !node.isEmpty && nodes.push(node))
  Object.values(teamBuffs.enemy ?? {}).forEach(node => !node.isEmpty && nodes.push(node))
  if (!nodes.length) return null

  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography>Team buff Stats</Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <FieldDisplayList sx={{ my: 0 }} >
        {nodes.map((n, i) => n && <NodeFieldDisplay key={i.toString() + (n.key ?? "")} node={n} component={ListItem} />)}
      </FieldDisplayList>
    </CardContent>
  </CardLight>
}
