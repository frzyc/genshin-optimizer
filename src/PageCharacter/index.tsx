import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Calculate, Checkroom, DeleteForever, FactCheck, Groups } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, IconButton, Pagination, Skeleton, TextField, Typography } from '@mui/material';
import i18next from 'i18next';
import React, { ChangeEvent, Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardDark from '../Components/Card/CardDark';
import CharacterCard from '../Components/Character/CharacterCard';
import { CharacterSelectionModal } from '../Components/Character/CharacterSelectionModal';
import SortByButton from '../Components/SortByButton';
import ElementToggle from '../Components/ToggleButton/ElementToggle';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import CharacterSheet from '../Data/Characters/CharacterSheet';
import { DatabaseContext } from '../Database/Database';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useDBState from '../ReactHooks/useDBState';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp';
import usePromise from '../ReactHooks/usePromise';
import { allCharacterKeys, CharacterKey, ElementKey, WeaponTypeKey } from '../Types/consts';
import { characterFilterConfigs, characterSortConfigs, characterSortKeys } from '../Util/CharacterSort';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';

const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
const numToShowMap = { xs: 4 - 1, sm: 4 - 1, md: 6 - 1, lg: 8 - 1, xl: 8 - 1 }

function initialState() {
  return {
    sortType: characterSortKeys[0],
    ascending: false,
    weaponType: "" as WeaponTypeKey | "",
    element: "" as ElementKey | "",
  }
}

export default function PageCharacter(props) {
  // TODO: #412 We shouldn't be loading all the character translation files. Should have a separate lookup file for character name.
  const { t } = useTranslation(["page_character", ...allCharacterKeys.map(k => `char_${k}_gen`)])
  const { database } = useContext(DatabaseContext)
  const [state, stateDispatch] = useDBState("CharacterDisplay", initialState)
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      setpageIdex(value - 1);
    },
    [setpageIdex, invScrollRef],
  )

  const brPt = useMediaQueryUp()
  const maxNumToDisplay = numToShowMap[brPt]

  const [newCharacter, setnewCharacter] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  //set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: '/characters' })
    return database.followAnyChar(forceUpdate)
  }, [forceUpdate, database])

  const characterSheets = usePromise(CharacterSheet.getAll, [])

  const deleteCharacter = useCallback(async (cKey: CharacterKey) => {
    const chararcterSheet = await CharacterSheet.get(cKey)
    let name = chararcterSheet?.name
    //use translated string
    if (typeof name === "object")
      name = i18next.t(`char_${cKey}_gen:name`)

    if (!window.confirm(t("removeCharacter", { value: name }))) return
    database.removeChar(cKey)
  }, [database, t])

  const editCharacter = useCharSelectionCallback()

  const navigate = useNavigate()

  const { element, weaponType } = state
  const sortConfigs = useMemo(() => characterSheets && characterSortConfigs(database, characterSheets), [database, characterSheets])
  const filterConfigs = useMemo(() => characterSheets && characterFilterConfigs(database, characterSheets), [database, characterSheets])
  const { charKeyList, totalCharNum } = useMemo(() => {
    const chars = database._getCharKeys()
    const totalCharNum = chars.length
    if (!sortConfigs || !filterConfigs) return { charKeyList: [], totalCharNum }
    const charKeyList = database._getCharKeys()
      .filter(filterFunction({ element, weaponType, favorite: "yes", name: deferredSearchTerm }, filterConfigs))
      .sort(sortFunction(state.sortType, state.ascending, sortConfigs))
      .concat(
        database._getCharKeys()
          .filter(filterFunction({ element, weaponType, favorite: "no", name: deferredSearchTerm }, filterConfigs))
          .sort(sortFunction(state.sortType, state.ascending, sortConfigs)))
    return dbDirty && { charKeyList, totalCharNum }
  },
    [dbDirty, database, sortConfigs, state.sortType, state.ascending, element, filterConfigs, weaponType, deferredSearchTerm])

  const { charKeyListToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(charKeyList.length / maxNumToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { charKeyListToShow: charKeyList.slice(currentPageIndex * maxNumToDisplay, (currentPageIndex + 1) * maxNumToDisplay), numPages, currentPageIndex }
  }, [charKeyList, pageIdex, maxNumToDisplay])

  const totalShowing = charKeyList.length !== totalCharNum ? `${charKeyList.length}/${totalCharNum}` : `${totalCharNum}`

  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <CardDark ref={invScrollRef} ><CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Grid container spacing={1}>
        <Grid item>
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDispatch({ weaponType })} value={state.weaponType} size="small" />
        </Grid>
        <Grid item>
          <ElementToggle sx={{ height: "100%" }} onChange={element => stateDispatch({ element })} value={state.element} size="small" />
        </Grid>
        <Grid item flexGrow={1}>
          <TextField
            autoFocus
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
            label={t("characterName")}
          />
        </Grid>
        <Grid item >
          <SortByButton sx={{ height: "100%" }}
            sortKeys={characterSortKeys} value={state.sortType} onChange={sortType => stateDispatch({ sortType })}
            ascending={state.ascending} onChangeAsc={ascending => stateDispatch({ ascending })} />
        </Grid>
      </Grid>
      <Grid container alignItems="flex-end">
        <Grid item flexGrow={1}>
          <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        </Grid>
        <Grid item>
          <ShowingCharacter numShowing={charKeyListToShow.length} total={totalShowing} t={t} />
        </Grid>
      </Grid>
    </CardContent></CardDark>
    <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} />}>
      <Grid container spacing={1} columns={columns}>
        <Grid item xs={1} >
          <CardDark sx={{ height: "100%", minHeight: 400, width: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography sx={{ textAlign: "center" }}><Trans t={t} i18nKey="addNew" /></Typography>
            </CardContent>
            <CharacterSelectionModal newFirst show={newCharacter} onHide={() => setnewCharacter(false)} onSelect={editCharacter} />
            <Box sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
            >
              <Button onClick={() => setnewCharacter(true)} color="info" sx={{ borderRadius: "1em" }}>
                <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>
              </Button>
            </Box>
          </CardDark>
        </Grid>
        {charKeyListToShow.map(charKey =>
          <Grid item key={charKey} xs={1} >
            <CharacterCard
              characterKey={charKey}
              onClick={() => navigate(`${charKey}`)}
              footer={<><Divider /><Box sx={{ py: 1, px: 2, display: "flex", gap: 1, justifyContent: "space-between" }}>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.talent")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/talent`)}>
                    <FactCheck />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.equip")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/equip`)} >
                    <Checkroom />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.teambuffs")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/teambuffs`)} >
                    <Groups />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.optimize")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/optimize`)} >
                    <Calculate />
                  </IconButton>
                </BootstrapTooltip>
                <Divider orientation="vertical" />
                <BootstrapTooltip placement="top" title={<Typography>{t("delete")}</Typography>}>
                  <IconButton color="error" onClick={() => deleteCharacter(charKey)}>
                    <DeleteForever />
                  </IconButton>
                </BootstrapTooltip>
              </Box></>}
            />
          </Grid>)}
      </Grid>
    </Suspense>
    {numPages > 1 && <CardDark ><CardContent>
      <Grid container alignItems="flex-end">
        <Grid item flexGrow={1}>
          <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        </Grid>
        <Grid item>
          <ShowingCharacter numShowing={charKeyListToShow.length} total={totalShowing} t={t} />
        </Grid>
      </Grid>
    </CardContent></CardDark>}
  </Box>
}
function ShowingCharacter({ numShowing, total, t }) {
  return <Typography color="text.secondary">
    <Trans t={t} i18nKey="showingNum" count={numShowing} value={total} >
      Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Characters
    </Trans>
  </Typography>
}
