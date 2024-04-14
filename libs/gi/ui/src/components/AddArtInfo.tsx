import { Alert, Link } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

export function AddArtInfo() {
  const { t } = useTranslation('artifact')
  return (
    <Alert severity="info" variant="filled">
      <Trans t={t} i18nKey={'noArtifacts'}>
        {
          "Looks like you haven't added any artifacts yet. If you want, there are "
        }
        <Link
          color="warning.main"
          component={RouterLink}
          to="/scanner"
          fontFamily="inherit"
        >
          automatic scanners
        </Link>
        {' that can speed up the import process!'}
      </Trans>
    </Alert>
  )
}
