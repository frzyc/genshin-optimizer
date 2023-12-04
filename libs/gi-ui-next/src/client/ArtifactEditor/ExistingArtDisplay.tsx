import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'
import { CardThemed } from '@genshin-optimizer/ui-common'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { TFunction } from 'i18next'
import { ArtifactCard } from '../ArtifactCard'

export default function ExistingArtDisplay({
  artifact,
  old,
  oldType,
  t,
}: {
  artifact: Artifact
  old?: Artifact
  oldType?: 'edit' | 'duplicate' | 'upgrade'
  t: TFunction<'artifact', undefined>
}) {
  const theme = useTheme()
  const grmd = useMediaQuery(theme.breakpoints.up('md'))
  if (!old) return null
  return (
    <Grid container sx={{ justifyContent: 'space-around' }} spacing={1}>
      <Grid item xs={12} md={5.5} lg={4}>
        <CardThemed bgt="light">
          <Typography
            sx={{ textAlign: 'center' }}
            py={1}
            variant="h6"
            color="text.secondary"
          >
            {oldType !== 'edit'
              ? oldType === 'duplicate'
                ? t`editor.dupArt`
                : t`editor.upArt`
              : t`editor.beforeEdit`}
          </Typography>
          <ArtifactCard artifact={old} disabled />
        </CardThemed>
      </Grid>
      {grmd && (
        <Grid
          item
          md={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CardThemed bgt="light" sx={{ display: 'flex' }}>
            <ChevronRightIcon sx={{ fontSize: 40 }} />
          </CardThemed>
        </Grid>
      )}
      <Grid item xs={12} md={5.5} lg={4}>
        <CardThemed bgt="light">
          <Typography
            sx={{ textAlign: 'center' }}
            py={1}
            variant="h6"
            color="text.secondary"
          >{t`editor.preview`}</Typography>
          <ArtifactCard artifact={artifact} disabled />
        </CardThemed>
      </Grid>
    </Grid>
  )
}
