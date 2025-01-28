import { CardThemed } from '@genshin-optimizer/common/ui'
import { DiscFilterDisplay } from '@genshin-optimizer/zzz/ui'
import { Button, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import { t } from 'i18next'
import { Suspense } from 'react'
import { Trans } from 'react-i18next'

export default function DiscFilter({
  numShowing,
  total,
  discIds,
}: {
  numShowing: number
  total: number
  discIds: string[]
}) {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={300} />}
    >
      <CardThemed>
        <CardContent>
          <Grid container>
            <Grid item>
              <Typography variant="h6">
                <Trans t={t} i18nKey="ui:discFilter">
                  Disc Filter
                </Trans>
              </Typography>
            </Grid>
            <Grid
              item
              flexGrow={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography>
                <strong>{numShowing}</strong> / {total}
              </Typography>
            </Grid>
            <Grid item>
              <Button size="small" color="error">
                <Trans t={t} i18nKey="ui:reset" />
              </Button>
            </Grid>
          </Grid>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={400} />
            }
          >
            <DiscFilterDisplay></DiscFilterDisplay>
          </Suspense>
        </CardContent>
      </CardThemed>
    </Suspense>
  )
}
