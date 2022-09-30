import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeleteForever, FactCheck, Groups, Science, TrendingUp } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, IconButton, Pagination, Skeleton, TextField, Typography } from '@mui/material';
import { ChangeEvent, Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardDark from '../Components/Card/CardDark';
import CharacterCard from '../Components/Character/CharacterCard';
import SortByButton from '../Components/SortByButton';
import ElementToggle from '../Components/ToggleButton/ElementToggle';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import CharacterSheet from '../Data/Characters/CharacterSheet';
import { DatabaseContext } from '../Database/Database';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useDBMeta from '../ReactHooks/useDBMeta';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp';
import usePromise from '../ReactHooks/usePromise';
import { CharacterKey, charKeyToCharName } from '../Types/consts';
import { characterFilterConfigs, characterSortConfigs, characterSortMap } from '../Util/CharacterSort';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';
import { CharacterSelectionModal } from './CharacterSelectionModal';

const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
const numToShowMap = { xs: 6 - 1, sm: 8 - 1, md: 12 - 1, lg: 16 - 1, xl: 16 - 1 }
const sortKeys = Object.keys(characterSortMap)

export default function PageCharacter() {
  const { t } = useTranslation(["page_character", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const [state, setState] = useState(() => database.displayCharacter.get())
  useEffect(() => database.displayCharacter.follow((r, s) => setState(s)), [database, setState])
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const setPage = useCallback(
    (_: ChangeEvent<unknown>, value: number) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      database.displayCharacter.set({ pageIndex: value - 1 });
    },
    [database, invScrollRef]
  )

  const brPt = useMediaQueryUp()
  const maxNumToDisplay = numToShowMap[brPt]

  const [newCharacter, setnewCharacter] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  // Set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: '/characters' })
    return database.chars.followAny((k, r) => (r === "new" || r === "remove") && forceUpdate())
  }, [forceUpdate, database])

  // character favorite updater
  useEffect(() => database.charMeta.followAny(s => forceUpdate()), [forceUpdate, database])

  const characterSheets = usePromise(() => CharacterSheet.getAll, [])
  const { gender } = useDBMeta()
  const deleteCharacter = useCallback(async (cKey: CharacterKey) => {
    const chararcterSheet = await CharacterSheet.get(cKey, gender)
    let name = chararcterSheet?.name
    // Use translated string
    if (typeof name === "object")
      name = t(`charNames_gen:${charKeyToCharName(cKey, gender)}`)

    if (!window.confirm(t("removeCharacter", { value: name }))) return
    database.chars.remove(cKey)
  }, [database, gender, t])

  const editCharacter = useCharSelectionCallback()

  const navigate = useNavigate()

  const deferredState = useDeferredValue(state)
  const deferredDbDirty = useDeferredValue(dbDirty)
  const { charKeyList, totalCharNum } = useMemo(() => {
    const chars = database.chars.keys
    const totalCharNum = chars.length
    if (!characterSheets) return { charKeyList: [], totalCharNum }
    const { element, weaponType, sortType, ascending } = deferredState
    const charKeyList = database.chars.keys
      .filter(filterFunction({ element, weaponType, name: deferredSearchTerm }, characterFilterConfigs(database, characterSheets)))
      .sort(sortFunction(characterSortMap[sortType] ?? [], ascending, characterSortConfigs(database, characterSheets), ["new", "favorite"]))
    return deferredDbDirty && { charKeyList, totalCharNum }
  },
    [deferredDbDirty, database, characterSheets, deferredState, deferredSearchTerm])

  const { weaponType, element, sortType, ascending, pageIndex = 0 } = state

  const { charKeyListToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(charKeyList.length / maxNumToDisplay)
    const currentPageIndex = clamp(pageIndex, 0, numPages - 1)
    return { charKeyListToShow: charKeyList.slice(currentPageIndex * maxNumToDisplay, (currentPageIndex + 1) * maxNumToDisplay), numPages, currentPageIndex }
  }, [charKeyList, pageIndex, maxNumToDisplay])

  const totalShowing = charKeyList.length !== totalCharNum ? `${charKeyList.length}/${totalCharNum}` : `${totalCharNum}`

  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <CardDark ref={invScrollRef} ><CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Grid container spacing={1}>
        <Grid item>
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => database.displayCharacter.set({ weaponType })} value={weaponType} size="small" />
        </Grid>
        <Grid item>
          <ElementToggle sx={{ height: "100%" }} onChange={element => database.displayCharacter.set({ element })} value={element} size="small" />
        </Grid>
        <Grid item flexGrow={1}>
          <TextField
            autoFocus
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
            label={t("characterName")}
            size="small"
            sx={{ height: "100%" }}
            InputProps={{
              sx: { height: "100%" }
            }}
          />
        </Grid>
        <Grid item >
          <SortByButton sx={{ height: "100%" }}
            sortKeys={sortKeys} value={sortType} onChange={sortType => database.displayCharacter.set({ sortType })}
            ascending={ascending} onChangeAsc={ascending => database.displayCharacter.set({ ascending })} />
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
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.teambuffs")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/teambuffs`)} >
                    <Groups />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.optimize")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/optimize`)} >
                    <TrendingUp />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.theorycraft")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/theorycraft`)} >
                    <Science />
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
