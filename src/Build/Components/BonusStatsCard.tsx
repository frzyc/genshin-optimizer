import { CardContent, Divider, Typography } from '@mui/material';
import React from 'react';
import CardLight from '../../Components/Card/CardLight';
import FieldDisplay, { FieldDisplayList } from '../../Components/FieldDisplay';
import { ICachedCharacter } from '../../Types/character';
import statsToFields from '../../Util/FieldUtil';
export default function BonusStatsCard({ character }: { character: ICachedCharacter }) {
  const bonusStats = Object.fromEntries(Object.entries(character?.bonusStats).filter(([key]) =>
    !((key as string).endsWith("enemyImmunity") || (key as string).endsWith("enemyRes_") || key === "enemyLevel")))
  if (!Object.keys(bonusStats).length) return null
  const setStatsFields = statsToFields(bonusStats)
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography>Bonus Stats</Typography>
    </CardContent>
    <Divider />
    <CardContent><FieldDisplayList sx={{ my: 0 }} >
      {setStatsFields.map((field, i) => <FieldDisplay key={i} field={field} />)}
    </FieldDisplayList></CardContent>
  </CardLight>
}