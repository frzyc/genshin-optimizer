import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import DatabaseCard from './DatabaseCard'
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
        <LanguageCard />
        <SnowToggle />
        <SillyCard />
        <DatabaseCard />
      </CardContent>
    </CardThemed>
  )
}
