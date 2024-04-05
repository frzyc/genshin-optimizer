import { Alert } from '@mui/material'

// TODO: Translation
export function BuildInfoAlert() {
  return (
    <Alert severity="info">
      A <strong>Build</strong> is comprised of a weapon and 5 artifacts. A{' '}
      <strong>TC Build</strong> allows the artifacts to be created from its
      stats.
    </Alert>
  )
}
