import { AppBar, Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { celestia } from '../theme/celestia'

declare const __VERSION__: string
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
      sx={{
        bgcolor: celestia.header,
        backgroundImage: 'none',
        borderTop: `1px solid ${celestia.hairline}`,
      }}
      elevation={0}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        sx={{ px: 2, py: 1 }}
        gap={2}
      >
        <Typography
          variant="caption"
          sx={{ color: celestia.faint, textAlign: 'right' }}
        >
          <Trans
            t={t}
            i18nKey="ui:appVersion"
            values={{ version: __VERSION__ }}
          >
            Genshin Optimizer Version:
            <a
              href={
                process.env.NX_URL_GITHUB_GO_CURRENT_VERSION ||
                `${process.env.NX_URL_GITHUB_GO}/releases`
              }
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit' }}
            >
              {{ version: __VERSION__ } as any}
            </a>
          </Trans>
        </Typography>
      </Box>
    </AppBar>
  )
}
