import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ShowingAndSortOptionSelect,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { initialWengine } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { WengineCard } from '@genshin-optimizer/zzz/ui'
import type { WengineSortKey } from '@genshin-optimizer/zzz/util'
import {
  wengineFilterConfigs,
  wengineSortConfigs,
  wengineSortMap,
} from '@genshin-optimizer/zzz/util'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  TextField,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import WengineFilter from './WengineFilter'

const columns = { xs: 2, sm: 3, md: 4, lg: 4, xl: 6 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

const sortKeys = Object.keys(wengineSortMap)
export default function PageWengine() {
  const { t } = useTranslation(['page_wengine', 'ui'])
  const { database } = useDatabaseContext()
  const state = useDataEntryBase(database.displayWengine)
  const [dbDirty, forceUpdate] = useForceUpdate()
  //set follow, should run only once
  useEffect(() => {
    //ReactGA.send({ hitType: 'pageview', page: '/wengine' }) Needs Google Analytics
    return database.wengines.followAny(
      (_, r) =>
        (r === 'new' || r === 'remove' || r === 'update') && forceUpdate()
    )
  }, [forceUpdate, database])
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const newWengine = useCallback(
    (wengineKey: WengineKey) => {
      database.wengines.new(initialWengine(wengineKey))
    },
    [database]
  )

  const {
    sortType,
    ascending,
    speciality,
    rarity,
    locked,
    showEquipped,
    showInventory,
    locations,
  } = state

  const { wengineIds, totalWengineNum } = useMemo(() => {
    const wengines = database.wengines.values
    const totalWengineNum = wengines.length
    const wengineIds = wengines
      .filter(
        filterFunction(
          {
            speciality,
            rarity,
            name: deferredSearchTerm,
            locked,
            showInventory,
            showEquipped,
            locations,
          },
          wengineFilterConfigs()
        )
      )
      .sort(
        sortFunction(
          wengineSortMap[sortType as WengineSortKey] ?? [],
          ascending,
          wengineSortConfigs()
        )
      )
      .map((key) => key.id)
    return dbDirty && { wengineIds, totalWengineNum }
  }, [
    database.wengines.values,
    speciality,
    rarity,
    deferredSearchTerm,
    locked,
    showInventory,
    showEquipped,
    locations,
    sortType,
    ascending,
    dbDirty,
  ])

  const brPt = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    wengineIds.length
  )
  const wenginesIdsToShow = useMemo(
    () => wengineIds.slice(0, numShow),
    [wengineIds, numShow]
  )

  // Pagination
  const totalShowing =
    wengineIds.length !== totalWengineNum
      ? `${wengineIds.length}/${totalWengineNum}`
      : `${totalWengineNum}`

  const showingTextProps = {
    numShowing: wenginesIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'page_wengine',
  }

  const sortByButtonProps = {
    sortKeys: [...sortKeys],
    value: sortType,
    onChange: (sortType: string) =>
      database.displayWengine.set({ sortType: sortType as WengineSortKey }),
    ascending: ascending,
    onChangeAsc: (ascending: boolean) =>
      database.displayWengine.set({ ascending }),
  }
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
        <WengineFilter
          numShowing={wengineIds.length}
          total={totalWengineNum}
          wengineIds={wengineIds}
        />
        <CardThemed>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                autoFocus
                size="small"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setSearchTerm(e.target.value)
                }
                label={t('wengineName')}
                sx={{ height: '100%' }}
                InputProps={{ sx: { height: '100%' } }}
              />
              <ShowingAndSortOptionSelect
                showingTextProps={showingTextProps}
                sortByButtonProps={sortByButtonProps}
              />
            </Box>
          </CardContent>
        </CardThemed>
        <Button
          fullWidth
          onClick={() =>
            newWengine(
              allWengineKeys[Math.floor(Math.random() * allWengineKeys.length)]
            )
          }
          color="info"
        >
          {t('page_wengine:addWengine')}
        </Button>
        <Grid container spacing={1} columns={columns}>
          {wengineIds.map((wengineIds) => (
            <Grid item key={wengineIds} xs={1}>
              <WengineCard
                wengineId={wengineIds}
                onEdit={() => {}}
                onDelete={() => {}}
                setLocation={() => {}}
                onLockToggle={() => {}}
              ></WengineCard>
            </Grid>
          ))}
        </Grid>
      </Suspense>
      {wengineIds.length !== wenginesIdsToShow.length && (
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
    </Box>
  )
}
