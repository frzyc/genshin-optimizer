import { Alert, Link } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

export default function NoArtWarning() {
  const { t } = useTranslation('page_character_optimize')
  return (
    <Alert severity="warning" variant="filled">
      <Trans t={t} i18nKey="noArtis">
        Oops! It looks like you haven't added any artifacts to GO yet! You
        should go to the
        <Link component={RouterLink} to="/artifacts">
          Artifacts
        </Link>
        page and add some!
      </Trans>
    </Alert>
  )
}
