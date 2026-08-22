import { LocalStorageUsageCard } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { DatabaseCard } from '@genshin-optimizer/gi/ui'
import { CardContent, Divider, Grid, Typography } from '@mui/material'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import LanguageCard from './LanguageCard'
import SillyCard from './SillyCard'
import { SnowToggle } from './SnowToggle'

export default function PageSettings() {
  const { t } = useTranslation(['settings'])
  ReactGA.send({ hitType: 'pageview', page: '/setting' })

  return (
    <CardThemed sx={{ my: 1 }}>
      <CardContent sx={{ py: 1 }}>
        <Typography variant="subtitle1">
          <Trans t={t} i18nKey="title" />
        </Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container direction="row" spacing={1}>
          <Grid item xs={6}>
            <LanguageCard />
          </Grid>
          <Grid item xs={6}>
            <SnowToggle />
          </Grid>
        </Grid>
        <Grid container direction="row" spacing={1}>
          <Grid item sm={12} md={6}>
            <SillyCard />
          </Grid>
          <Grid item sm={12} md={6}>
            <LocalStorageUsageCard />
          </Grid>
        </Grid>
        <DatabaseCard />
      </CardContent>
    </CardThemed>
  )
}
