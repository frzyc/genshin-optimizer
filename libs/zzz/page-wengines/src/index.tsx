import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { WengineCard } from '@genshin-optimizer/zzz/ui'
import { Box, Grid, Skeleton } from '@mui/material'
import { Suspense } from 'react'
const columns = { xs: 2, sm: 3, md: 4, lg: 4, xl: 6 }

export default function PageWengine() {
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {allWengineKeys.map((wengineKey) => (
            <Grid item key={wengineKey} xs={1}>
              <WengineCard
                wengineKey={wengineKey}
                onEdit={() => {}}
                onDelete={() => {}}
                setLocation={() => {}}
                onLockToggle={() => {}}
              ></WengineCard>
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Box>
  )
}
