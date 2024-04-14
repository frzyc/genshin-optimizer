import { CardThemed, InfoTooltip } from '@genshin-optimizer/common/ui'
import { Grid, Typography } from '@mui/material'
import { Trans } from 'react-i18next'
import { PercentBadge } from '../../PercentBadge'

export function SubstatEfficiencyDisplayCard({
  efficiency,
  max = false,
  t,
  valid,
}) {
  const eff = max ? 'maxSubEff' : 'curSubEff'
  return (
    <CardThemed bgt="light" sx={{ py: 1, px: 2 }}>
      <Grid container spacing={1}>
        <Grid item>{t(`editor.${eff}`)}</Grid>
        <Grid item flexGrow={1}>
          <InfoTooltip
            title={
              <span>
                <Typography variant="h6">{t(`editor.${eff}`)}</Typography>
                <Typography>
                  <Trans t={t} i18nKey={`editor.${eff}Desc`} />
                </Typography>
              </span>
            }
          />
        </Grid>
        <Grid item xs="auto">
          <PercentBadge
            valid={valid}
            max={9}
            value={valid ? efficiency : 'ERR'}
          />
        </Grid>
      </Grid>
    </CardThemed>
  )
}
