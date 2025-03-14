import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { sortFunction } from '@genshin-optimizer/common/util'
import { allPathKeys, allRarityKeys } from '@genshin-optimizer/sr/consts'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import {
  lightConeSortConfigs,
  lightConeSortKeys,
  lightConeSortMap,
} from '@genshin-optimizer/sr/util'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LightConeCard } from './LightConeCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export type LightConeInventoryProps = {
  onAdd?: () => void
  onEdit?: (id: string) => void
}

export function LightConeInventory({ onAdd, onEdit }: LightConeInventoryProps) {
  const { t } = useTranslation('lightCone')
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()

  // lives here until DB storage for UI sort/filter options is created
  const initialSort = () => ({
    sortType: lightConeSortKeys[0],
    ascending: false,
    rarity: [...allRarityKeys],
    path: [...allPathKeys],
  })

  // no way to currently change state of sort until
  // ability to store UI sort/filter options get added to DB storage
  // until then, initialize a default sort
  const { sortType, ascending } = initialSort()

  useEffect(
    () => database.lightCones.followAny(setDirtyDatabase),
    [database, setDirtyDatabase],
  )

  const { lightConeIds, totalLightConeNum } = useMemo(() => {
    const lightCones = database.lightCones.values
    const totalLightConeNum = lightCones.length
    const lightConeIds = lightCones
      .sort(
        sortFunction(
          lightConeSortMap[sortType] ?? [],
          ascending,
          lightConeSortConfigs(),
        ),
      )
      .map((lc) => lc.id)
    return dirtyDatabase && { lightConeIds, totalLightConeNum }
  }, [database, dirtyDatabase, sortType, ascending])

  const brPt = useMediaQueryUp()

  const totalShowing =
    lightConeIds.length !== totalLightConeNum
      ? `${lightConeIds.length}/${totalLightConeNum}`
      : `${totalLightConeNum}`

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    lightConeIds.length,
  )
  const lightConeIdsToShow = useMemo(
    () => lightConeIds.slice(0, numShow),
    [lightConeIds, numShow],
  )

  const showingTextProps = {
    numShowing: lightConeIdsToShow.length,
    total: totalShowing,
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
              {showingTextProps.total} Items
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
            sx={{ width: '100%', height: '100%', minHeight: 300 }}
          />
        }
      >
        <Grid container columns={columns} spacing={1}>
          {lightConeIdsToShow.map((lightConeId) => (
            <Grid item key={lightConeId} xs={1}>
              <LightConeCard
                lightCone={database.lightCones.get(lightConeId)!}
                onEdit={() => onEdit?.(lightConeId)}
                onDelete={() => database.lightCones.remove(lightConeId)}
                setLocation={(location) =>
                  database.lightCones.set(lightConeId, { location })
                }
                canEquip
              />
            </Grid>
          ))}
        </Grid>

        {lightConeIds.length !== lightConeIdsToShow.length && (
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
