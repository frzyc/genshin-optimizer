import { useDataManagerKeys } from '@genshin-optimizer/common/database-ui'
import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RelicCard } from './RelicCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export type RelicInventoryProps = {
  onAdd?: () => void
  onEdit?: (id: string) => void
}

export function RelicInventory({ onAdd, onEdit }: RelicInventoryProps) {
  const { t } = useTranslation('relic')
  const { database } = useDatabaseContext()
  const relicIds = useDataManagerKeys(database.relics)
  const totalRelicsNum = relicIds.length

  const brPt = useMediaQueryUp()
  const totalShowing =
    relicIds.length !== totalRelicsNum
      ? `${relicIds.length}/${totalRelicsNum}`
      : totalRelicsNum
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    relicIds.length
  )

  const relicsIdsToShow = useMemo(
    () => relicIds.slice(0, numShow),
    [relicIds, numShow]
  )
  const showingTextProps = {
    numShowing: relicsIdsToShow.length,
    totalShowing: totalShowing,
  }

  return (
    <>
      <CardThemed bgt="dark">
        <CardContent>
          <Box
            pb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography color="text.secondary">
              Showing <b>{showingTextProps.numShowing}</b> out of{' '}
              {showingTextProps.totalShowing} Items
            </Typography>
          </Box>
        </CardContent>
      </CardThemed>
      <Grid container columns={columns} spacing={1}>
        <Grid item xs>
          <Button
            fullWidth
            onClick={onAdd}
            color="info"
            startIcon={<AddIcon />}
          >
            {t('addNew')}
          </Button>
        </Grid>
      </Grid>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container columns={columns} spacing={1}>
          {relicsIdsToShow.map((relicId) => (
            <Grid item key={relicId} xs={1}>
              <RelicCard
                relic={database.relics.get(relicId)!}
                onEdit={() => onEdit?.(relicId)}
                onDelete={() => database.relics.remove(relicId)}
                setLocation={(location) =>
                  database.relics.set(relicId, { location })
                }
                onLockToggle={() =>
                  database.relics.set(relicId, ({ lock }) => ({ lock: !lock }))
                }
              />
            </Grid>
          ))}
        </Grid>
        {relicIds.length !== relicsIdsToShow.length && (
          <Skeleton
            ref={(node) => {
              if (!node) return
              setTriggerElement(node)
            }}
            sx={{ borderRadius: 1 }}
            variant="rectangular"
            width="100%"
            height={100}
          />
        )}
      </Suspense>
    </>
  )
}
