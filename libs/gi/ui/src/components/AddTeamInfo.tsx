import { Alert } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

export function AddTeamInfo() {
  const { t } = useTranslation('page_character')
  return (
    <Alert severity="warning">
      <Trans t={t} i18nKey="noLoadout">
        Looks like you haven't added any loadout/Teams with this character yet.
        You need to create a loadout+team with this character to{' '}
        <strong>create builds</strong>, <strong>theorycraft</strong>, or{' '}
        <strong>optimize</strong>.
      </Trans>
    </Alert>
  )
}
