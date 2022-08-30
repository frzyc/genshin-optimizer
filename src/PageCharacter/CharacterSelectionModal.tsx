import { Box, CardContent, Divider, Grid, TextField } from "@mui/material";
import { ChangeEvent, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CardDark from "../Components/Card/CardDark";
import CharacterCard from "../Components/Character/CharacterCard";
import CloseButton from "../Components/CloseButton";
import ModalWrapper from "../Components/ModalWrapper";
import SortByButton from "../Components/SortByButton";
import ElementToggle from "../Components/ToggleButton/ElementToggle";
import WeaponToggle from "../Components/ToggleButton/WeaponToggle";
import { DataContext } from "../Context/DataContext";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../Database/Database";
import useDBState from "../ReactHooks/useDBState";
import useForceUpdate from "../ReactHooks/useForceUpdate";
import usePromise from "../ReactHooks/usePromise";
import { ICachedCharacter } from "../Types/character";
import { allCharacterKeys, CharacterKey } from "../Types/consts";
import { characterFilterConfigs, characterSortConfigs, characterSortKeys } from "../Util/CharacterSort";
import { filterFunction, sortFunction } from "../Util/SortByFilters";
import { initialCharacterDisplayState } from "./CharacterDisplayState";

type characterFilter = (character: ICachedCharacter | undefined, sheet: CharacterSheet) => boolean

type CharacterSelectionModalProps = {
  show: boolean,
  newFirst?: boolean
  onHide: () => void,
  onSelect?: (ckey: CharacterKey) => void,
  filter?: characterFilter
}

export function CharacterSelectionModal({ show, onHide, onSelect, filter = () => true, newFirst = false }: CharacterSelectionModalProps) {
  const sortKeys = useMemo(() => newFirst ? [...characterSortKeys] : characterSortKeys.slice(1), [newFirst])
  const { database } = useContext(DatabaseContext)
  const [state, stateDispatch] = useDBState("CharacterDisplay", initialCharacterDisplayState)
  const { weaponType, element } = state
  const { t } = useTranslation(["page_character", "charNames_gen"])

  const [sortBy, setsortBy] = useState(sortKeys[0])
  const [ascending, setascending] = useState(false)

  const characterSheets = usePromise(() => CharacterSheet.getAll, [])

  const [favesDirty, setFavesDirty] = useForceUpdate()
  useEffect(() => {
    return database.states.followAny(s => typeof s === "string" && s.includes("charMeta_") && setFavesDirty())
  }, [setFavesDirty, database])

  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const sortConfigs = useMemo(() => characterSheets && characterSortConfigs(database, characterSheets), [database, characterSheets])
  const filterConfigs = useMemo(() => characterSheets && favesDirty && characterFilterConfigs(database, characterSheets), [favesDirty, database, characterSheets])
  const ownedCharacterKeyList = useMemo(() => characterSheets ? allCharacterKeys.filter(cKey => filter(database.chars.get(cKey), characterSheets[cKey])) : [], [database, characterSheets, filter])
  const characterKeyList = useMemo(() => (characterSheets && sortConfigs && filterConfigs) ?
    ownedCharacterKeyList
      .filter(filterFunction({ element, weaponType, favorite: "yes", name: deferredSearchTerm }, filterConfigs))
      .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number)
      .concat(
        ownedCharacterKeyList
          .filter(filterFunction({ element, weaponType, favorite: "no", name: deferredSearchTerm }, filterConfigs))
          .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number)
      )
    : [],
    [characterSheets, element, weaponType, sortBy, ascending, sortConfigs, filterConfigs, ownedCharacterKeyList, deferredSearchTerm])

  if (!characterSheets) return null
  return <ModalWrapper open={show} onClose={onHide} sx={{ "& .MuiContainer-root": { justifyContent: "normal" } }}>
    <CardDark>
      <CardContent sx={{ py: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDispatch({ weaponType })} value={weaponType} size="small" />
        <ElementToggle sx={{ height: "100%" }} onChange={element => stateDispatch({ element })} value={element} size="small" />
        <Box flexGrow={1}>
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
        </Box>
        <SortByButton sx={{ height: "100%" }}
          sortKeys={sortKeys} value={sortBy} onChange={setsortBy as any}
          ascending={ascending} onChangeAsc={setascending} />
        <CloseButton onClick={onHide} />
      </CardContent>
      <Divider />
      <DataContext.Provider value={{ teamData: undefined } as any}>
        <CardContent><Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
          {characterKeyList.map(characterKey => <Grid item key={characterKey} xs={1} >
            <CharacterCard key={characterKey} hideStats characterKey={characterKey} onClick={() => { onHide(); onSelect?.(characterKey) }} />
          </Grid>)}
        </Grid></CardContent>
      </DataContext.Provider>
    </CardDark>
  </ModalWrapper>
}
