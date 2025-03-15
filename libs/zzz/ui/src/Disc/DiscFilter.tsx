import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  useDatabaseContext,
  useDisplayDisc,
} from '@genshin-optimizer/zzz/db-ui'
import type { DiscFilterOption } from '@genshin-optimizer/zzz/util'
import ReplayIcon from '@mui/icons-material/Replay'
import { Button, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import { t } from 'i18next'
import { Suspense, useCallback } from 'react'
import { Trans } from 'react-i18next'
import { DiscFilterDisplay } from './DiscFilterDisplay'

export default function DiscFilter({
  numShowing,
  total,
  discIds,
}: {
  numShowing: number
  total: number
  discIds: string[]
}) {
  const database = useDatabaseContext().database
  const { filterOption } = useDisplayDisc()
  const filterOptionDispatch = useCallback(
    (option: Partial<DiscFilterOption>) =>
      database.displayDisc.set({
        filterOption: {
          ...filterOption,
          ...option,
        },
      }),
    [database, filterOption],
  )
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={300} />}
    >
      <CardThemed>
        <CardContent>
          <Grid container>
            <Grid item>
              <Typography variant="h6">{t('discFilter')}</Typography>
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
              <Button
                size="small"
                color="error"
                onClick={() => database.displayDisc.set({ action: 'reset' })}
                startIcon={<ReplayIcon />}
              >
                <Trans t={t} i18nKey="ui:reset" />
              </Button>
            </Grid>
          </Grid>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={400} />
            }
          >
            <DiscFilterDisplay
              filterOption={filterOption}
              filterOptionDispatch={filterOptionDispatch}
              filteredIds={discIds}
            />
          </Suspense>
        </CardContent>
      </CardThemed>
    </Suspense>
  )
}
