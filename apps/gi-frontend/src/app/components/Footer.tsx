'use client'
import { AppBar, Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import { Trans, useTranslation } from 'react-i18next'

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
    <AppBar
      component="footer"
      position="static"
      sx={{ bgcolor: 'neutral800.main' }}
      elevation={0}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ px: 2, py: 1 }}
        gap={2}
      >
        <Typography variant="caption" sx={{ color: 'neutral400.main' }}>
          <Trans t={t} i18nKey="ui:rightsDisclaimer">
            Genshin Optimizer is not affiliated with or endorsed by HoYoverse.
          </Trans>
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'neutral400.main', textAlign: 'right' }}
        >
          <Trans
            t={t}
            i18nKey="ui:appVersion"
            values={{ version: process.env['go_version'] }}
          >
            Genshin Optimizer Version:
            <a
              // TODO: env variable?
              href="https://github.com/frzyc/genshin-optimizer/releases"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit' }}
            >
              {process.env['go_version']}
            </a>
          </Trans>
        </Typography>
      </Box>
    </AppBar>
  )
}
