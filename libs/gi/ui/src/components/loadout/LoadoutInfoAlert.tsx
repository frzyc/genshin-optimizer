import { Alert } from '@mui/material'

// TODO: Translation
export function LoadoutInfoAlert() {
  return (
    <Alert severity="info">
      <strong>Loadouts</strong> provides character context data, including bonus
      stats, conditionals, multi-targets, optimization config, and stores
      builds. A single <strong>Loadout</strong> can be used for many teams.
    </Alert>
  )
}
