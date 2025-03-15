import { AppBar, Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'

export default function Footer() {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={64} />}>
      <FooterContent />
    </Suspense>
  )
}
function FooterContent() {
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
          Build:
          <a
            href={
              process.env.NX_URL_GITHUB_GO_CURRENT_VERSION ||
              `${process.env.NX_URL_GITHUB_GO}/releases`
            }
            target="_blank"
            rel="noreferrer"
            style={{ color: 'inherit' }}
          >
            {process.env.NX_URL_GITHUB_GO_CURRENT_VERSION?.replace(
              /.*commit\//,
              '',
            ).substring(0, 7)}
          </a>
        </Typography>
      </Box>
    </AppBar>
  )
}
