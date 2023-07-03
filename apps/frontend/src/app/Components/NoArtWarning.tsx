import { Alert, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NoArtWarning() {
  return (
    <Alert severity="warning" variant="filled">
      Opps! It looks like you haven't added any artifacts to GO yet! You should
      go to the{' '}
      <Link component={RouterLink} to="/artifact">
        Artifacts
      </Link>{' '}
      page and add some!
    </Alert>
  )
}
