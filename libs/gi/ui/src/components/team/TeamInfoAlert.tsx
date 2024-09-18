import { Alert } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

export function TeamInfoAlert() {
  const { t } = useTranslation('page_team')
  return (
    <Alert severity="info">
      <Trans t={t} i18nKey={'teamSettings.alert.desc'}>
        <strong>Teams</strong> are a container for 4 character loadouts. It
        provides a way for characters to apply team buffs, and configuration of
        enemy stats. Loadouts can be shared between teams.
      </Trans>
    </Alert>
  )
}
