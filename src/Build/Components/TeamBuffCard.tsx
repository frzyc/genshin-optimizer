import { CardContent, Divider, Typography } from '@mui/material';
import React, { useContext } from 'react';
import CardLight from '../../Components/Card/CardLight';
import FieldDisplay, { FieldDisplayList } from '../../Components/FieldDisplay';
import statsToFields from '../../Util/FieldUtil';
import { buildContext } from '../Build';
export default function TeamBuffCard() {
  const { equippedBuild } = useContext(buildContext)
  const partyBuff = equippedBuild?.partyBuff
  if (!Object.keys(partyBuff ?? {}).length) return null
  const setStatsFields = statsToFields(partyBuff)
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography>Team buff Stats</Typography>
    </CardContent>
    <Divider />
    <CardContent><FieldDisplayList sx={{ my: 0 }} >
      {setStatsFields.map((field, i) => <FieldDisplay key={i} field={field} />)}
    </FieldDisplayList></CardContent>
  </CardLight>
}