import { CardThemed } from '@genshin-optimizer/common/ui'
import { DatabaseCard } from '@genshin-optimizer/zzz/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import LanguageCard from './LanguageCard'

export default function PageSettings() {
  const { t } = useTranslation(['page_settings'])

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
        <DatabaseCard />
      </CardContent>
    </CardThemed>
  )
}
