import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, CardContent, Grid, Pagination, Skeleton, ToggleButton, Typography } from '@mui/material';
import i18next from 'i18next';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from 'react-i18next';
import CardDark from '../Components/Card/CardDark';
import SolidToggleButtonGroup from '../Components/SolidToggleButtonGroup';
import SortByButton from '../Components/SortByButton';
import { Stars } from '../Components/StarDisplay';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import WeaponSelectionModal from '../Components/Weapon/WeaponSelectionModal';
import WeaponSheet from '../Data/Weapons/WeaponSheet';
import { DatabaseContext } from '../Database/Database';
import useDBState from '../ReactHooks/useDBState';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp';
import usePromise from '../ReactHooks/usePromise';
import { allRarities, WeaponKey, WeaponTypeKey } from '../Types/consts';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';
import { weaponFilterConfigs, weaponSortConfigs, weaponSortKeys } from '../Util/WeaponSort';
import { initialWeapon } from '../Util/WeaponUtil';
import WeaponCard from './WeaponCard';

//lazy load the weapon display
const WeaponEditor = lazy(() => import('./WeaponEditor'))

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10 - 1, sm: 12 - 1, md: 24 - 1, lg: 24 - 1, xl: 24 - 1 }

const initialState = () => ({
  editWeaponId: "",
  sortType: weaponSortKeys[0],
  ascending: false,
  rarity: [5, 4],
  weaponType: "" as WeaponTypeKey | "",
})

export default function PageWeapon() {
  const { t } = useTranslation(["page_weapon", "ui"]);
  const { database } = useContext(DatabaseContext)
  const [state, stateDisplatch] = useDBState("WeaponDisplay", initialState)
  const [newWeaponModalShow, setnewWeaponModalShow] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const invScrollRef = useRef<HTMLDivElement>(null)
  const [pageIdex, setpageIdex] = useState(0)
  //set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: '/weapon' })
    return database.followAnyWeapon(forceUpdate)
  }, [forceUpdate, database])

  const brPt = useMediaQueryUp()
  const maxNumToDisplay = numToShowMap[brPt]

  const weaponSheets = usePromise(WeaponSheet.getAll, [])

  const deleteWeapon = useCallback(async (key) => {
    const weapon = database._getWeapon(key)
    if (!weapon) return
    const name = i18next.t(`weapon_${weapon.key}_gen:name`)

    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return
    database.removeWeapon(key)
    if (state.editWeaponId === key)
      stateDisplatch({ editWeaponId: "" })
  }, [state.editWeaponId, stateDisplatch, database])

  const editWeapon = useCallback(key => {
    stateDisplatch({ editWeaponId: key })
  }, [stateDisplatch])

  const newWeapon = useCallback(
    (weaponKey: WeaponKey) => {
      editWeapon(database.createWeapon(initialWeapon(weaponKey)))
    },
    [database, editWeapon])

  const { sortType, ascending, weaponType, rarity } = state
  const sortConfigs = useMemo(() => weaponSheets && weaponSortConfigs(weaponSheets), [weaponSheets])
  const filterConfigs = useMemo(() => weaponSheets && weaponFilterConfigs(weaponSheets), [weaponSheets])
  const { weaponIdList, totalWeaponNum } = useMemo(() => {
    const weapons = database._getWeapons()
    const totalWeaponNum = weapons.length
    if (!sortConfigs || !filterConfigs) return { weaponIdList: [], totalWeaponNum }
    const weaponIdList = weapons.filter(filterFunction({ weaponType, rarity }, filterConfigs))
      .sort(sortFunction(sortType, ascending, sortConfigs)).map(weapon => weapon.id);
    return dbDirty && { weaponIdList, totalWeaponNum }
  }, [dbDirty, database, sortConfigs, filterConfigs, sortType, ascending, rarity, weaponType])

  const { weaponIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(weaponIdList.length / maxNumToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { weaponIdsToShow: weaponIdList.slice(currentPageIndex * maxNumToDisplay, (currentPageIndex + 1) * maxNumToDisplay), numPages, currentPageIndex }
  }, [weaponIdList, pageIdex, maxNumToDisplay])

  //for pagination
  const totalShowing = weaponIdList.length !== totalWeaponNum ? `${weaponIdList.length}/${totalWeaponNum}` : `${totalWeaponNum}`
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      setpageIdex(value - 1);
    },
    [setpageIdex, invScrollRef],
  )

  const resetEditWeapon = useCallback(() => stateDisplatch({ editWeaponId: "" }), [stateDisplatch])

  const { editWeaponId } = state

  // Validate weaponId to be an actual weapon
  useEffect(() => {
    if (!editWeaponId) return
    if (!database._getWeapon(editWeaponId))
      resetEditWeapon()
  }, [database, editWeaponId, resetEditWeapon])

  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    {/* editor/character detail display */}
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
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDisplatch({ weaponType })} value={weaponType} size="small" />
        </Grid>
        <Grid item flexGrow={1}>
          <SolidToggleButtonGroup sx={{ height: "100%" }} onChange={(e, newVal) => stateDisplatch({ rarity: newVal })} value={rarity} size="small">
            {allRarities.map(star => <ToggleButton key={star} value={star}><Box display="flex" gap={1}><strong>{star}</strong><Stars stars={1} /></Box></ToggleButton>)}
          </SolidToggleButtonGroup>
        </Grid>
        <Grid item >
          <SortByButton sx={{ height: "100%" }} sortKeys={weaponSortKeys}
            value={sortType} onChange={sortType => stateDisplatch({ sortType })}
            ascending={ascending} onChangeAsc={ascending => stateDisplatch({ ascending })}
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
              <Typography sx={{ textAlign: "center" }}>Add New Weapon</Typography>
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
