import { AppBar, Box, Skeleton, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Suspense } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import packageInfo from '../../../../../package.json'

export default function Footer() {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={64} />}>
      <FooterContent />
    </Suspense>
  )
}
function FooterContent() {
  const { t } = useTranslation('ui')
  return (
    <AppBar position="static" sx={{ bgcolor: '#343a40' }} elevation={0}>
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ px: 2, py: 1 }}
        gap={2}
      >
        <Typography variant="caption" sx={{ color: grey[200] }}>
          <Trans t={t} i18nKey="ui:rightsDisclaimer">
            Genshin Optimizer is not affiliated with or endorsed by HoYoverse.
          </Trans>
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: grey[200], textAlign: 'right' }}
        >
          <Trans
            t={t}
            i18nKey="ui:appVersion"
            values={{ version: packageInfo.version }}
          >
            Genshin Optimizer Version:
            <a
              href={
                import.meta.env['NX_URL_GITHUB_GO_CURRENT_VERSION'] ||
                `${import.meta.env['NX_URL_GITHUB_GO']}/releases`
              }
              target="_blank"
              rel="noreferrer"
            >
              {{ version: packageInfo.version } as TransObject}
            </a>
          </Trans>
        </Typography>
      </Box>
    </AppBar>
  )
}
