import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, CardContent, Grid, Pagination, Skeleton, ToggleButton, Typography } from '@mui/material';
import i18next from 'i18next';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import CardDark from '../Components/Card/CardDark';
import SolidToggleButtonGroup from '../Components/SolidToggleButtonGroup';
import SortByButton from '../Components/SortByButton';
import { Stars } from '../Components/StarDisplay';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import WeaponSelectionModal from '../Components/Weapon/WeaponSelectionModal';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { allRarities, WeaponKey, WeaponTypeKey } from '../Types/consts';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';
import { weaponFilterConfigs, weaponSortConfigs, weaponSortKeys } from '../Util/WeaponSort';
import WeaponCard from './WeaponCard';
import WeaponSheet from './WeaponSheet';
import { initialWeapon } from './WeaponUtil';

//lazy load the weapon display
const WeaponDisplayCard = lazy(() => import('./WeaponDisplayCard'))

const initialState = () => ({
  editWeaponId: "",
  sortType: weaponSortKeys[0],
  ascending: false,
  rarity: [5, 4],
  weaponType: "" as WeaponTypeKey | "",
  maxNumToDisplay: 30,
})
export type stateType = ReturnType<typeof initialState>

function filterReducer(state: stateType, action): stateType {
  return { ...state, ...action }
}
function filterInit(initial = initialState()): stateType {
  return { ...initial, ...(dbStorage.get("WeaponDisplay.state") ?? {}) }
}

export default function WeaponDisplay(props) {
  const database = useContext(DatabaseContext)
  const [state, stateDisplatch] = useReducer(filterReducer, initialState(), filterInit)
  const [newWeaponModalShow, setnewWeaponModalShow] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const [pageIdex, setpageIdex] = useState(0)
  //set follow, should run only once
  useEffect(() => {
    ReactGA.pageview('/weapon')
    return database.followAnyWeapon(forceUpdate)
  }, [forceUpdate, database])

  //save to db
  useEffect(() => {
    dbStorage.set("WeaponDisplay.state", state)
  }, [state])

  const weaponSheets = usePromise(WeaponSheet.getAll(), [])

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
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 500);
  }, [stateDisplatch, scrollRef])

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
    const numPages = Math.ceil(weaponIdList.length / state.maxNumToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { weaponIdsToShow: weaponIdList.slice(currentPageIndex * state.maxNumToDisplay, (currentPageIndex + 1) * state.maxNumToDisplay), numPages, currentPageIndex }
  }, [weaponIdList, pageIdex, state.maxNumToDisplay])

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
  return <Box sx={{
    mt: 1,
    // select all excluding last
    "> div": { mb: 1 },
  }}>
    {/* editor/character detail display */}
    {!!editWeaponId && <Box ref={scrollRef} >
      <WeaponDisplayCard
        weaponId={editWeaponId}
        footer
        onClose={resetEditWeapon}
      />
    </Box>}
    <CardDark ref={invScrollRef} sx={{ p: 2, pb: 1 }}>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDisplatch({ weaponType })} value={weaponType} size="small" />
        </Grid>
        <Grid item flexGrow={1}>
          <SolidToggleButtonGroup sx={{ height: "100%" }} onChange={(e, newVal) => stateDisplatch({ rarity: newVal })} value={rarity} size="small">
            {allRarities.map(star => <ToggleButton key={star} value={star}><strong>{star}{' '}</strong><Stars stars={1} /></ToggleButton>)}
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
          <Typography color="text.secondary">
            {/* <Trans t={t} i18nKey="showingNum" count={numShowing} value={total} > */}
            Showing <b>{weaponIdsToShow.length}</b> out of {totalShowing} Weapons
            {/* </Trans> */}
          </Typography>
        </Grid>
      </Grid>
    </CardDark>
    <Grid container spacing={1}>
      <Suspense fallback={<Grid item xs={12}><Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 500 }} /></Grid>}>
        {!editWeaponId && <Grid item xs={6} md={4} lg={4} xl={3}>
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
              <Button onClick={() => setnewWeaponModalShow(true)} sx={{
                borderRadius: "1em"
              }}>
                <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>
              </Button>
            </Box>
          </CardDark>
        </Grid>}
        {weaponIdsToShow.map(weaponId =>
          <Grid item key={weaponId} xs={12} sm={6} md={4} lg={4} xl={3} >
            <WeaponCard
              weaponId={weaponId}
              onDelete={deleteWeapon}
              onEdit={editWeapon}
              canEquip
            />
          </Grid>)}
      </Suspense>
    </Grid>
  </Box>
}