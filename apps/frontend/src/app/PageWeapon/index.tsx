import { allRarities, allWeaponTypeKeys, WeaponKey } from '@genshin-optimizer/consts';
import { Add } from '@mui/icons-material';
import { Box, Button, CardContent, Grid, Pagination, Skeleton, TextField, Typography } from '@mui/material';
import React, { ChangeEvent, lazy, Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from 'react-i18next';
import CardDark from '../Components/Card/CardDark';
import SortByButton from '../Components/SortByButton';
import RarityToggle from '../Components/ToggleButton/RarityToggle';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import { getWeaponSheet } from '../Data/Weapons';
import { DatabaseContext } from '../Database/Database';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { catTotal } from '../Util/totalUtils';
import { clamp } from '../Util/Util';
import { weaponFilterConfigs, weaponSortConfigs, weaponSortMap } from '../Util/WeaponSort';
import { initialWeapon } from '../Util/WeaponUtil';
import WeaponCard from './WeaponCard';
const WeaponSelectionModal = React.lazy(() => import('../Components/Weapon/WeaponSelectionModal'))
// Lazy load the weapon display
const WeaponEditor = lazy(() => import('./WeaponEditor'))

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

const sortKeys = Object.keys(weaponSortMap)
export default function PageWeapon() {
  const { t } = useTranslation(["page_weapon", "ui", "weaponNames_gen"])
  const { database } = useContext(DatabaseContext)
  const [state, setState] = useState(database.displayWeapon.get())
  useEffect(() => database.displayWeapon.follow((r, dbMeta) => setState(dbMeta)), [database])

  const [newWeaponModalShow, setnewWeaponModalShow] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const invScrollRef = useRef<HTMLDivElement>(null)
  const [pageIndex, setPageIndex] = useState(0)
  //set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: '/weapon' })
    return database.weapons.followAny((k, r) => (r === "new" || r === "remove") && forceUpdate())
  }, [forceUpdate, database])

  const brPt = useMediaQueryUp()
  const maxNumToDisplay = numToShowMap[brPt]

  const deleteWeapon = useCallback(async (key: string) => {
    const weapon = database.weapons.get(key)
    if (!weapon) return
    const name = t(`weaponNames_gen:${weapon.key}`)

    if (!window.confirm(t("removeWeapon", { value: name }))) return
    database.weapons.remove(key)
    if (state.editWeaponId === key)
      database.displayWeapon.set({ editWeaponId: "" })
  }, [state.editWeaponId, database, t])

  const editWeapon = useCallback((key: string | undefined) => {
    database.displayWeapon.set({ editWeaponId: key })
  }, [database])

  const newWeapon = useCallback((weaponKey: WeaponKey) => {
    editWeapon(database.weapons.new(initialWeapon(weaponKey)))
  }, [database, editWeapon])

  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { sortType, ascending, weaponType, rarity } = state
  const { weaponIdList, totalWeaponNum } = useMemo(() => {
    const weapons = database.weapons.values
    const totalWeaponNum = weapons.length
    const weaponIdList = weapons
      .filter(filterFunction({ weaponType, rarity, name: deferredSearchTerm }, weaponFilterConfigs()))
      .sort(sortFunction(weaponSortMap[sortType] ?? [], ascending, weaponSortConfigs()))
      .map(weapon => weapon.id)
    return dbDirty && { weaponIdList, totalWeaponNum }
  }, [dbDirty, database, sortType, ascending, rarity, weaponType, deferredSearchTerm])

  const { weaponIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(weaponIdList.length / maxNumToDisplay)
    const currentPageIndex = clamp(pageIndex, 0, numPages - 1)
    return { weaponIdsToShow: weaponIdList.slice(currentPageIndex * maxNumToDisplay, (currentPageIndex + 1) * maxNumToDisplay), numPages, currentPageIndex }
  }, [weaponIdList, pageIndex, maxNumToDisplay])

  // Pagination
  const totalShowing = weaponIdList.length !== totalWeaponNum ? `${weaponIdList.length}/${totalWeaponNum}` : `${totalWeaponNum}`
  const setPage = useCallback(
    (_: ChangeEvent<unknown>, value: number) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      setPageIndex(value - 1);
    },
    [setPageIndex, invScrollRef]
  )

  const resetEditWeapon = useCallback(() => database.displayWeapon.set({ editWeaponId: "" }), [database])

  const { editWeaponId } = state

  // Validate weaponId to be an actual weapon
  useEffect(() => {
    if (!editWeaponId) return
    if (!database.weapons.get(editWeaponId))
      resetEditWeapon()
  }, [database, editWeaponId, resetEditWeapon])

  const weaponTotals = useMemo(() =>
    catTotal(allWeaponTypeKeys, ct => Object.entries(database.weapons.data).forEach(([id, weapon]) => {
      const wtk = getWeaponSheet(weapon.key).weaponType
      ct[wtk].total++
      if (weaponIdList.includes(id)) ct[wtk].current++
    })), [database, weaponIdList])

  const weaponRarityTotals = useMemo(() =>
    catTotal(allRarities, ct => Object.entries(database.weapons.data).forEach(([id, weapon]) => {
      const wr = getWeaponSheet(weapon.key).rarity
      ct[wr].total++
      if (weaponIdList.includes(id)) ct[wr].current++
    })), [database, weaponIdList])

  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <Suspense fallback={false}>
      <WeaponSelectionModal show={newWeaponModalShow} onHide={() => setnewWeaponModalShow(false)} onSelect={newWeapon} />
    </Suspense>
    {/* Editor/character detail display */}
    <Suspense fallback={false}>
      <WeaponEditor
        weaponId={editWeaponId}
        footer
        onClose={resetEditWeapon}
      />
    </Suspense>

    <CardDark ref={invScrollRef}><CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box display="flex" flexWrap="wrap" gap={1} alignItems="stretch">
        <WeaponToggle onChange={weaponType => database.displayWeapon.set({ weaponType })} value={weaponType} totals={weaponTotals} size="small" />
        <RarityToggle sx={{ height: "100%" }} onChange={rarity => database.displayWeapon.set({ rarity })} value={rarity} totals={weaponRarityTotals} size="small" />
        <Box flexGrow={1} />
        <TextField
          autoFocus
          size="small"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
          label={t("weaponName")}
          sx={{ height: "100%" }}
          InputProps={{
            sx: { height: "100%" }
          }}
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap">
        <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        <ShowingWeapon numShowing={weaponIdsToShow.length} total={totalShowing} t={t} />
        <SortByButton sx={{ height: "100%" }} sortKeys={sortKeys}
          value={sortType} onChange={sortType => database.displayWeapon.set({ sortType })}
          ascending={ascending} onChangeAsc={ascending => database.displayWeapon.set({ ascending })}
        />
      </Box>
    </CardContent></CardDark>
    <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 500 }} />}>
      <Button fullWidth onClick={() => setnewWeaponModalShow(true)} color="info" startIcon={<Add />} >{t("page_weapon:addWeapon")}</Button>
      <Grid container spacing={1} columns={columns}>
        {weaponIdsToShow.map(weaponId =>
          <Grid item key={weaponId} xs={1} >
            <WeaponCard
              weaponId={weaponId}
              onDelete={deleteWeapon}
              onEdit={editWeapon}
              canEquip
            />
          </Grid>)}
      </Grid>
    </Suspense>
    {numPages > 1 && <CardDark><CardContent>
      <Grid container alignItems="flex-end">
        <Grid item flexGrow={1}>
          <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        </Grid>
        <Grid item>
          <ShowingWeapon numShowing={weaponIdsToShow.length} total={totalShowing} t={t} />
        </Grid>
      </Grid>
    </CardContent></CardDark>}
  </Box>
}
function ShowingWeapon({ numShowing, total, t }) {
  return <Typography color="text.secondary">
    <Trans t={t} i18nKey="showingNum" count={numShowing} value={total} >
      Showing <b>{{ count: numShowing } as TransObject}</b> out of {{ value: total }} Weapons
    </Trans>
  </Typography>
}
