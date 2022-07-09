import { CardContent, Divider, Typography } from '@mui/material'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from "react-i18next"
import CardDark from '../Components/Card/CardDark'
import DatabaseCard from './DatabaseCard'
import LanguageCard from './LanguageCard'
import TCToggleCard from './TCToggleCard'

export default function PageSettings() {
  const { t } = useTranslation(["settings"]);
  ReactGA.send({ hitType: "pageview", page: '/setting' })

  return <CardDark sx={{ my: 1 }}>
    <CardContent sx={{ py: 1 }}>
      <Typography variant="subtitle1">
        <Trans t={t} i18nKey="title" />
      </Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <LanguageCard />
      <DatabaseCard />
      <TCToggleCard />
    </CardContent>
  </CardDark>
}
