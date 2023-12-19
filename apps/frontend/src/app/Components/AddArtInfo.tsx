import { Alert, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function AddArtInfo() {
  return (
    <Alert severity="info" variant="filled">
      Looks like you haven't added any artifacts yet. If you want, there are
      <Link color="warning.main" component={RouterLink} to="/scanner">
        automatic scanners
      </Link>
      that can speed up the import process!
    </Alert>
  )
}
