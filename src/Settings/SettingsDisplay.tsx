import { CardContent, Divider, Typography } from '@mui/material'
import ReactGA from 'react-ga'
import { Trans, useTranslation } from "react-i18next"
import CardDark from '../Components/Card/CardDark'
import useForceUpdate from '../ReactHooks/useForceUpdate'
import DownloadCard from './Components/DownloadCard'
import LanguageCard from './Components/LanguageCard'
import TCToggleCard from './Components/TCToggleCard'
import UploadCard from './Components/UploadCard'

export default function SettingsDisplay() {
  const { t } = useTranslation(["settings"]);
  const [, forceUpdate] = useForceUpdate()
  ReactGA.pageview('/setting')

  return <CardDark sx={{ my: 1 }}>
    <CardContent sx={{ py: 1 }}>
      <Typography variant="subtitle1">
        <Trans t={t} i18nKey="title" />
      </Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <LanguageCard />
      <DownloadCard forceUpdate={forceUpdate} />
      <UploadCard forceUpdate={forceUpdate} />
      <TCToggleCard />
    </CardContent>
  </CardDark>
}
