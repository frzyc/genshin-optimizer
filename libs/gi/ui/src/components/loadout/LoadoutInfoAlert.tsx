import { Alert } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

// TODO: Translation
export function LoadoutInfoAlert() {
  const { t } = useTranslation('page_character')
  return (
    <Alert severity="info">
      <Trans t={t} i18nKey={'loadoutSettings.alert'}>
        <strong>Loadouts</strong> provides character context data, including
        bonus stats, conditionals, multi-targets, optimization config, and
        stores builds. A single <strong>Loadout</strong> can be used for many
        teams.
      </Trans>
    </Alert>
  )
}
