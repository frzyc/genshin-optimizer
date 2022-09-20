import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, CardContent, Grid, Pagination, Skeleton, TextField, ToggleButton, Typography } from '@mui/material';
import React, { ChangeEvent, lazy, Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from 'react-i18next';
import CardDark from '../Components/Card/CardDark';
import SolidToggleButtonGroup from '../Components/SolidToggleButtonGroup';
import SortByButton from '../Components/SortByButton';
import { StarsDisplay } from '../Components/StarDisplay';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import WeaponSelectionModal from '../Components/Weapon/WeaponSelectionModal';
import WeaponSheet from '../Data/Weapons/WeaponSheet';
import { DatabaseContext } from '../Database/Database';
import useDBState from '../ReactHooks/useDBState';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp';
import usePromise from '../ReactHooks/usePromise';
import { allRarities, allWeaponTypeKeys, WeaponKey } from '../Types/consts';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';
import { weaponFilterConfigs, weaponSortConfigs, weaponSortKeys, weaponSortMap } from '../Util/WeaponSort';
import { initialWeapon } from '../Util/WeaponUtil';
import WeaponCard from './WeaponCard';

// Lazy load the weapon display
const WeaponEditor = lazy(() => import('./WeaponEditor'))

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10 - 1, sm: 12 - 1, md: 24 - 1, lg: 24 - 1, xl: 24 - 1 }

const initialState = () => ({
  editWeaponId: "",
  sortType: weaponSortKeys[0],
  ascending: false,
  rarity: [...allRarities],
  weaponType: [...allWeaponTypeKeys],
})

const sortKeys = Object.keys(weaponSortMap)

export default function PageWeapon() {
  const { t } = useTranslation(["page_weapon", "ui", "weaponNames_gen"])
  const { database } = useContext(DatabaseContext)
  const [state, stateDispatch] = useDBState("WeaponDisplay", initialState)
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

  const weaponSheets = usePromise(() => WeaponSheet.getAll, [])

  const deleteWeapon = useCallback(async (key: string) => {
    const weapon = database.weapons.get(key)
    if (!weapon) return
    const name = t(`weaponNames_gen:${weapon.key}`)

    if (!window.confirm(t("removeWeapon", { value: name }))) return
    database.weapons.remove(key)
    if (state.editWeaponId === key)
      stateDispatch({ editWeaponId: "" })
  }, [state.editWeaponId, stateDispatch, database, t])

  const editWeapon = useCallback((key: string | undefined) => {
    stateDispatch({ editWeaponId: key })
  }, [stateDispatch])

  const newWeapon = useCallback(
    (weaponKey: WeaponKey) => {
      editWeapon(database.weapons.new(initialWeapon(weaponKey)))
    },
    [database, editWeapon])

  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { sortType, ascending, weaponType, rarity } = state
  const { weaponIdList, totalWeaponNum } = useMemo(() => {
    const weapons = database.weapons.values
    const totalWeaponNum = weapons.length
    if (!weaponSheets) return { weaponIdList: [], totalWeaponNum }
    const weaponIdList = weapons
      .filter(filterFunction({ weaponType, rarity, name: deferredSearchTerm }, weaponFilterConfigs(weaponSheets)))
      .sort(sortFunction(weaponSortMap[sortType] ?? [], ascending, weaponSortConfigs(weaponSheets)))
      .map(weapon => weapon.id)
    return dbDirty && { weaponIdList, totalWeaponNum }
  }, [dbDirty, database, weaponSheets, sortType, ascending, rarity, weaponType, deferredSearchTerm])

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

  const resetEditWeapon = useCallback(() => stateDispatch({ editWeaponId: "" }), [stateDispatch])

  const { editWeaponId } = state

  // Validate weaponId to be an actual weapon
  useEffect(() => {
    if (!editWeaponId) return
    if (!database.weapons.get(editWeaponId))
      resetEditWeapon()
  }, [database, editWeaponId, resetEditWeapon])

  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    {/* Editor/character detail display */}
    <Suspense fallback={false}>
      <WeaponEditor
        weaponId={editWeaponId}
        footer
        onClose={resetEditWeapon}
      />
    </Suspense>

    <CardDark ref={invScrollRef} sx={{ p: 2, pb: 1 }}>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDispatch({ weaponType })} value={weaponType} size="small" />
        </Grid>
        <Grid item>
          <SolidToggleButtonGroup sx={{ height: "100%" }} onChange={(e, newVal) => stateDispatch({ rarity: newVal })} value={rarity} size="small">
            {allRarities.map(star => <ToggleButton key={star} value={star}><Box display="flex" gap={1}><strong>{star}</strong><StarsDisplay stars={1} /></Box></ToggleButton>)}
          </SolidToggleButtonGroup>
        </Grid>
        <Grid item flexGrow={1}>
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
        </Grid>
        <Grid item>
          <SortByButton sx={{ height: "100%" }} sortKeys={sortKeys}
            value={sortType} onChange={sortType => stateDispatch({ sortType })}
            ascending={ascending} onChangeAsc={ascending => stateDispatch({ ascending })}
          />
        </Grid>
      </Grid>
      <Grid container alignItems="flex-end">
        <Grid item flexGrow={1}>
          <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        </Grid>
        <Grid item>
          <ShowingWeapon numShowing={weaponIdsToShow.length} total={totalShowing} t={t} />
        </Grid>
      </Grid>
    </CardDark>
    <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 500 }} />}>
      <Grid container spacing={1} columns={columns}>
        <Grid item xs={1}>
          <CardDark sx={{ height: "100%", width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography sx={{ textAlign: "center" }}>{t("page_weapon:addWeapon")}</Typography>
            </CardContent>
            <WeaponSelectionModal show={newWeaponModalShow} onHide={() => setnewWeaponModalShow(false)} onSelect={newWeapon} />
            <Box sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
            >
              <Button onClick={() => setnewWeaponModalShow(true)} color="info" sx={{ borderRadius: "1em" }}>
                <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>
              </Button>
            </Box>
          </CardDark>
        </Grid>
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
      Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Weapons
    </Trans>
  </Typography>
}
