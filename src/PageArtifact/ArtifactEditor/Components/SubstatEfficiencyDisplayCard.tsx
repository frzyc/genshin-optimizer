import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Trans } from 'react-i18next';
import CardLight from '../../../Components/Card/CardLight';
import InfoTooltip from '../../../Components/InfoTooltip';
import PercentBadge from '../../../Components/PercentBadge';

export default function SubstatEfficiencyDisplayCard({ efficiency, max = false, t, valid }) {
  const eff = max ? "maxSubEff" : "curSubEff"
  return <CardLight sx={{ py: 1, px: 2 }}>
    <Grid container spacing={1}>
      <Grid item>{t(`editor.${eff}`)}</Grid>
      <Grid item flexGrow={1}>
        <InfoTooltip title={<span>
          <Typography variant="h6">{t(`editor.${eff}`)}</Typography>
          <Typography><Trans t={t} i18nKey={`editor.${eff}Desc`} /></Typography>
        </span>} />
      </Grid>
      <Grid item xs="auto">
        <PercentBadge valid={valid} max={900} value={valid ? efficiency : "ERR"} />
      </Grid>
    </Grid>
  </CardLight>
}
