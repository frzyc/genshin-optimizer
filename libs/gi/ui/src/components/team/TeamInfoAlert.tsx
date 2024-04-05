import { Alert } from '@mui/material'

// TODO: Translation
export function TeamInfoAlert() {
  return (
    <Alert severity="info">
      <strong>Teams</strong> are a container for 4 character loadouts. It
      provides a way for characters to apply team buffs, and configuration of
      enemy stats. Loadouts can be shared between teams.
    </Alert>
  )
}
