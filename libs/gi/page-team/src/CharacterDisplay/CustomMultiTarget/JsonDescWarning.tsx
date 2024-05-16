import { Alert } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

export default function JsonDescWarning() {
  const { t } = useTranslation('page_character')
  return (
    <Alert severity="warning" variant="filled">
      <Trans t={t} i18nKey="jsonDescWarning">
        It seems like you're trying to import a multi-opt config. This isn't the
        right place for that! Please go back one modal and press{' '}
        <strong>Import Multi-Opt.</strong>
      </Trans>
    </Alert>
  )
}
