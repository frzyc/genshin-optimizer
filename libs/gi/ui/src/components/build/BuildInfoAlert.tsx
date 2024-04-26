import { Alert } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'

export function EquippedBuildInfoAlert() {
  const { t } = useTranslation('page_team')
  return (
    <Alert severity="info">
      <Trans t={t} i18nKey="buildInfo.equipped">
        This is the build currently equipped to your character, this represents
        in-game equipement and is persistent outside of the Loadout.
      </Trans>
    </Alert>
  )
}
export function BuildInfoAlert() {
  const { t } = useTranslation('page_team')
  return (
    <Alert severity="info">
      <Trans t={t} i18nKey="buildInfo.build">
        This is the build currently equipped to your character, this represents
        in-game equipement and is persistent outside of the Loadout.
      </Trans>
    </Alert>
  )
}

export function TCBuildInfoAlert() {
  const { t } = useTranslation('page_team')
  return (
    <Alert severity="info">
      <Trans t={t} i18nKey="buildInfo.tcbuild">
        This is the build currently equipped to your character, this represents
        in-game equipement and is persistent outside of the Loadout.
      </Trans>
    </Alert>
  )
}
