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
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { initialWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  WeaponCard,
  WeaponEditor,
  WeaponSelectionModal,
  weaponFilterConfigs,
  weaponSortConfigs,
  weaponSortMap,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
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
import ReactGA from 'react-ga4'
import { useTranslation } from 'react-i18next'
import WeaponFilter, { WeaponRedButtons } from './WeaponFilter'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

const sortKeys = Object.keys(weaponSortMap)
export default function PageWeapon() {
  const { t } = useTranslation(['page_weapon', 'ui', 'weaponNames_gen'])
  const database = useDatabase()
  const [state, setState] = useState(database.displayWeapon.get())
  useEffect(
    () => database.displayWeapon.follow((_r, dbMeta) => setState(dbMeta)),
    [database]
  )

  const [newWeaponModalShow, setnewWeaponModalShow] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  //set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: '/weapon' })
    return database.weapons.followAny(
      (_k, r) =>
        (r === 'new' || r === 'remove' || r === 'update') && forceUpdate()
    )
  }, [forceUpdate, database])

  const brPt = useMediaQueryUp()

  const deleteWeapon = useCallback(
    async (key: string) => {
      const weapon = database.weapons.get(key)
      if (!weapon) return
      const name = t(`weaponNames_gen:${weapon.key}`)

      if (!window.confirm(t('removeWeapon', { value: name }))) return
      database.weapons.remove(key)
      if (state.editWeaponId === key)
        database.displayWeapon.set({ editWeaponId: '' })
    },
    [state.editWeaponId, database, t]
  )

  const editWeapon = useCallback(
    (key: string | undefined) => {
      database.displayWeapon.set({ editWeaponId: key })
    },
    [database]
  )

  const newWeapon = useCallback(
    (weaponKey: WeaponKey) => {
      editWeapon(database.weapons.new(initialWeapon(weaponKey)))
    },
    [database, editWeapon]
  )

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const {
    sortType,
    ascending,
    weaponType,
    rarity,
    locked,
    showEquipped,
    showInventory,
    locations,
  } = state

  const { weaponIds, totalWeaponNum } = useMemo(() => {
    const weapons = database.weapons.values
    const totalWeaponNum = weapons.length
    const weaponIds = weapons
      .filter(
        filterFunction(
          {
            weaponType,
            rarity,
            name: deferredSearchTerm,
            locked,
            showInventory,
            showEquipped,
            locations,
          },
          weaponFilterConfigs()
        )
      )
      .sort(
        sortFunction(
          weaponSortMap[sortType] ?? [],
          ascending,
          weaponSortConfigs()
        )
      )
      .map((weapon) => weapon.id)
    return dbDirty && { weaponIds, totalWeaponNum }
  }, [
    dbDirty,
    database,
    sortType,
    ascending,
    rarity,
    weaponType,
    locked,
    showInventory,
    showEquipped,
    locations,
    deferredSearchTerm,
  ])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    weaponIds.length
  )
  const weaponIdsToShow = useMemo(
    () => weaponIds.slice(0, numShow),
    [weaponIds, numShow]
  )

  // Pagination
  const totalShowing =
    weaponIds.length !== totalWeaponNum
      ? `${weaponIds.length}/${totalWeaponNum}`
      : `${totalWeaponNum}`

  const resetEditWeapon = useCallback(
    () => database.displayWeapon.set({ editWeaponId: '' }),
    [database]
  )

  const { editWeaponId } = state

  // Validate weaponId to be an actual weapon
  useEffect(() => {
    if (!editWeaponId) return
    if (!database.weapons.get(editWeaponId)) resetEditWeapon()
  }, [database, editWeaponId, resetEditWeapon])

  const showingTextProps = {
    numShowing: weaponIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'page_weapon',
  }

  const sortByButtonProps = {
    sortKeys: [...sortKeys],
    value: sortType,
    onChange: (sortType) => database.displayWeapon.set({ sortType }),
    ascending: ascending,
    onChangeAsc: (ascending) => database.displayWeapon.set({ ascending }),
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={false}>
        <WeaponSelectionModal
          show={newWeaponModalShow}
          onHide={() => setnewWeaponModalShow(false)}
          onSelect={newWeapon}
        />
      </Suspense>
      {/* Editor/character detail display */}
      <Suspense fallback={false}>
        <WeaponEditor
          weaponId={editWeaponId}
          footer
          onClose={resetEditWeapon}
        />
      </Suspense>

      <WeaponFilter
        numShowing={weaponIds.length}
        total={totalWeaponNum}
        weaponIds={weaponIds}
      />
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              label={t('weaponName')}
              sx={{ height: '100%' }}
              InputProps={{ sx: { height: '100%' } }}
            />
            <ShowingAndSortOptionSelect
              showingTextProps={showingTextProps}
              sortByButtonProps={sortByButtonProps}
            />
          </Box>
          <WeaponRedButtons weaponIds={weaponIds} />
        </CardContent>
      </CardThemed>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 500 }}
          />
        }
      >
        <Button
          fullWidth
          onClick={() => setnewWeaponModalShow(true)}
          color="info"
          startIcon={<AddIcon />}
        >
          {t('page_weapon:addWeapon')}
        </Button>
        <Grid container spacing={1} columns={columns}>
          {weaponIdsToShow.map((weaponId) => (
            <Grid item key={weaponId} xs={1}>
              <WeaponCard
                weaponId={weaponId}
                onDelete={deleteWeapon}
                onEdit={editWeapon}
                canEquip
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
      {weaponIds.length !== weaponIdsToShow.length && (
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
