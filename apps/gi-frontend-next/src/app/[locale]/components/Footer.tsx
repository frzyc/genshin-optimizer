'use client'
import { AppBar, Box, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Trans, useTranslation } from 'react-i18next'
import packageInfo from '../../../../../../package.json'

export default function Footer() {
  const { t } = useTranslation('ui')
  return (
    <AppBar position="static" sx={{ bgcolor: '#343a40' }}>
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
              href={`${process.env['NEXT_PUBLIC_GITHUB_GO_URL']}/releases`}
              target="_blank"
              rel="noreferrer"
            >
              {{ version: packageInfo.version } as any}
            </a>
          </Trans>
        </Typography>
      </Box>
    </AppBar>
  )
}
