import { faCalculator, faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import i18next from 'i18next';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import CardDark from '../Components/Card/CardDark';
import CloseButton from '../Components/CloseButton';
import InfoComponent from '../Components/InfoComponent';
import SortByButton from '../Components/SortByButton';
import ElementToggle from '../Components/ToggleButton/ElementToggle';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { CharacterKey, ElementKey, WeaponTypeKey } from '../Types/consts';
import characterSortOptions, { sortKeys } from '../Util/CharacterSort';
import SortByFilters from '../Util/SortByFilters';
import { defaultInitialWeapon } from '../Weapon/WeaponUtil';
import CharacterCard from './CharacterCard';
import { CharacterSelectionModal } from '../Components/Character/CharacterSelectionModal';
import CharacterSheet from './CharacterSheet';
import { initialCharacter } from './CharacterUtil';

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('./CharacterDisplayCard'))

const initialState = () => ({
  characterKeyToEdit: "" as CharacterKey | "",
  sortType: sortKeys[0],
  ascending: false,
  weaponType: "" as WeaponTypeKey | "",
  element: "" as ElementKey | "",
})
export type stateType = ReturnType<typeof initialState>

function filterReducer(state: stateType, action): stateType {
  return { ...state, ...action }
}
function filterInit(initial = initialState()): stateType {
  return { ...initial, ...(dbStorage.get("CharacterDisplay.state") ?? {}) }
}

export default function CharacterDisplay(props) {
  const database = useContext(DatabaseContext)
  const [state, stateDisplatch] = useReducer(filterReducer, initialState(), filterInit)
  const [newCharacter, setnewCharacter] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const scrollRef = useRef(null as any)
  //set follow, should run only once
  useEffect(() => {
    ReactGA.pageview('/character')
    return database.followAnyChar(forceUpdate)
  }, [forceUpdate, database])

  const allCharacterSheets = usePromise(CharacterSheet.getAll(), [])
  //save to db
  useEffect(() => {
    dbStorage.set("CharacterDisplay.state", state)
  }, [state])

  const deleteCharacter = useCallback(async (cKey: CharacterKey) => {
    const chararcterSheet = await CharacterSheet.get(cKey)
    let name = chararcterSheet?.name
    //use translated string
    if (typeof name === "object")
      name = i18next.t(`char_${cKey}_gen:name`)

    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return
    database.removeChar(cKey)
    if (state.characterKeyToEdit === cKey)
      stateDisplatch({ characterKeyToEdit: "" })
  }, [state.characterKeyToEdit, stateDisplatch, database])

  const editCharacter = useCallback(cKey => {
    if (!database._getChar(cKey))
      (async () => {
        //Create a new character + weapon, with linking.
        const newChar = initialCharacter(cKey)
        database.updateChar(newChar)
        const characterSheet = await CharacterSheet.get(cKey)
        if (!characterSheet) return
        const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
        const weaponId = database.createWeapon(weapon)
        database.setWeaponLocation(weaponId, cKey)
        stateDisplatch({ characterKeyToEdit: cKey })
      })()
    else
      stateDisplatch({ characterKeyToEdit: cKey })
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 500);
  }, [stateDisplatch, scrollRef, database])

  const cancelEditCharacter = useCallback(() => {
    stateDisplatch({ characterKeyToEdit: "" })
    setnewCharacter(false)
  }, [stateDisplatch])

  const sortOptions = useMemo(() => allCharacterSheets && characterSortOptions(database, allCharacterSheets), [database, allCharacterSheets])

  const charKeyList = useMemo(() => sortOptions && dbDirty && database._getCharKeys().filter(cKey => {
    if (state.element && state.element !== allCharacterSheets?.[cKey]?.elementKey) return false
    if (state.weaponType && state.weaponType !== allCharacterSheets?.[cKey]?.weaponTypeKey) return false
    return true
  }).sort(SortByFilters(state.sortType, state.ascending, sortOptions) as (a: CharacterKey, b: CharacterKey) => number),
    [dbDirty, database, sortOptions, allCharacterSheets, state.element, state.weaponType, state.sortType, state.ascending])
  return <Box sx={{ mt: 1, "> div": { mb: 1 }, }}>
    <InfoComponent
      pageKey="characterPage"
      modalTitle="Character Management Page Guide"
      text={["Every character will be tested with in-game numbers for maximum accuracy.",
        "You can see the details of the calculations of every number.",
        "You need to manually enable auto infusion for characters like Choungyun or Noelle.",
        "You can change character constellations in both \"Character\" tab and in \"Talents\" tab.",
        "Modified character Stats are bolded."]}
    >
      <InfoDisplay />
    </InfoComponent>
    {/* editor/character detail display */}
    {!!state.characterKeyToEdit ? <Box ref={scrollRef}>
      <React.Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
        <CharacterDisplayCard
          setCharacterKey={editCharacter}
          characterKey={state.characterKeyToEdit}
          onClose={cancelEditCharacter}
          footer={<CharDisplayFooter onClose={cancelEditCharacter} characterKey={state.characterKeyToEdit} />}
        />
      </React.Suspense>
    </Box> : null}
    <CardDark sx={{ p: 2 }}>
      <Grid container spacing={1}>
        <Grid item>
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDisplatch({ weaponType })} value={state.weaponType} size="small" />
        </Grid>
        <Grid item flexGrow={1}>
          <ElementToggle sx={{ height: "100%" }} onChange={element => stateDisplatch({ element })} value={state.element} size="small" />
        </Grid>
        <Grid item >
          <SortByButton sx={{ height: "100%" }}
            sortKeys={sortKeys} value={state.sortType} onChange={sortType => stateDisplatch({ sortType })}
            ascending={state.ascending} onChangeAsc={ascending => stateDisplatch({ ascending })} />
        </Grid>
      </Grid>
    </CardDark>
    <Grid container spacing={1}>
      <Suspense fallback={<Grid item xs={12}><Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} /></Grid>}>
        {!state.characterKeyToEdit && <Grid item xs={12} sm={6} md={4} lg={3} >
          <CardDark sx={{ height: "100%", minHeight: 400, width: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography sx={{ textAlign: "center" }}>Add New Character</Typography>
            </CardContent>
            <CharacterSelectionModal newFirst show={newCharacter} onHide={() => setnewCharacter(false)} onSelect={editCharacter} />
            <Box sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
            >
              <Button onClick={() => setnewCharacter(true)} sx={{
                borderRadius: "1em"
              }}>
                <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>
              </Button>
            </Box>
          </CardDark>
        </Grid>}
        {!!charKeyList && charKeyList.map(charKey =>
          <Grid item key={charKey} xs={12} sm={6} md={4} lg={3} >
            <CharacterCard
              characterKey={charKey}
              onDelete={deleteCharacter}
              onEdit={editCharacter}
              footer
            />
          </Grid>)}
      </Suspense>
    </Grid>
  </Box>
}
function CharDisplayFooter({ onClose, characterKey }) {
  return <Grid container spacing={1}>
    <Grid item>
      <Button component={Link} to={{
        pathname: "/build",
        characterKey
      } as any}
        startIcon={<FontAwesomeIcon icon={faCalculator} />}
      >Generate Builds</Button>
    </Grid>
    <Grid item flexGrow={1}>
      <Button color="info" component={Link} to={{ pathname: "/flex", characterKey } as any}
        startIcon={<FontAwesomeIcon icon={faLink} />}
      >Share Character</Button>
    </Grid>
    <Grid item xs="auto">
      <CloseButton large onClick={onClose} />
    </Grid>
  </Grid>
}