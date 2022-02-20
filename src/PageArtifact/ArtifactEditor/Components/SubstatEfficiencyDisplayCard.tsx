import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import { Trans } from 'react-i18next';
import BootstrapTooltip from '../../../Components/BootstrapTooltip';
import CardLight from '../../../Components/Card/CardLight';
import PercentBadge from '../../PercentBadge';

export default function SubstatEfficiencyDisplayCard({ efficiency, max = false, t, valid }) {
  const eff = max ? "maxSubEff" : "curSubEff"
  return <CardLight sx={{ py: 1, px: 2 }}>
    <Grid container spacing={1}>
      <Grid item>{t(`editor.${eff}`)}</Grid>
      <Grid item flexGrow={1}>
        <BootstrapTooltip placement="top" title={<span>
          <Typography variant="h6">{t(`editor.${eff}`)}</Typography>
          <Typography><Trans t={t} i18nKey={`editor.${eff}Desc`} /></Typography>
        </span>}>
          <span><Box component={FontAwesomeIcon} icon={faQuestionCircle} sx={{ cursor: "help" }} /></span>
        </BootstrapTooltip>
      </Grid>
      <Grid item xs="auto">
        <PercentBadge valid={valid} max={900} value={valid ? efficiency : "ERR"} />
      </Grid>
    </Grid>
  </CardLight>
}
