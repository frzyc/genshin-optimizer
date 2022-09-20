import { Box, CardActionArea, CardContent, Chip, Divider, Grid, Skeleton, TextField, Tooltip, tooltipClasses, TooltipProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { ChangeEvent, Suspense, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CardDark from "../Components/Card/CardDark";
import CardLight from "../Components/Card/CardLight";
import CharacterCard from "../Components/Character/CharacterCard";
import CloseButton from "../Components/CloseButton";
import ModalWrapper from "../Components/ModalWrapper";
import SortByButton from "../Components/SortByButton";
import SqBadge from "../Components/SqBadge";
import { StarsDisplay } from "../Components/StarDisplay";
import ElementToggle from "../Components/ToggleButton/ElementToggle";
import WeaponToggle from "../Components/ToggleButton/WeaponToggle";
import { DataContext } from "../Context/DataContext";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { ascensionMaxLevel } from "../Data/LevelData";
import { DatabaseContext } from "../Database/Database";
import useCharacter from "../ReactHooks/useCharacter";
import useDBState from "../ReactHooks/useDBState";
import useForceUpdate from "../ReactHooks/useForceUpdate";
import useGender from "../ReactHooks/useGender";
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
    // character favorite updater
    return database.states.followAny(s => s.includes("charMeta_") && setFavesDirty())
  }, [setFavesDirty, database])

  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const sortConfigs = useMemo(() => characterSheets && characterSortConfigs(database, characterSheets), [database, characterSheets])
  const filterConfigs = useMemo(() => characterSheets && favesDirty && characterFilterConfigs(database, characterSheets), [favesDirty, database, characterSheets])
  const gender = useGender(database)
  const ownedCharacterKeyList = useMemo(() => characterSheets ? allCharacterKeys.filter(cKey => filter(database.chars.get(cKey), characterSheets(cKey, gender)!)) : [], [database, gender, characterSheets, filter])
  const characterKeyList = useMemo(() => (sortConfigs && filterConfigs) ?
    ownedCharacterKeyList
      .filter(filterFunction({ element, weaponType, favorite: "yes", name: deferredSearchTerm }, filterConfigs))
      .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number)
      .concat(
        ownedCharacterKeyList
          .filter(filterFunction({ element, weaponType, favorite: "no", name: deferredSearchTerm }, filterConfigs))
          .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number)
      )
    : [],
    [element, weaponType, sortBy, ascending, sortConfigs, filterConfigs, ownedCharacterKeyList, deferredSearchTerm])

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
        <CardContent><Grid container spacing={1} columns={{ xs: 2, sm: 3, md: 4, lg: 5, }}>
          {characterKeyList.map(characterKey => <Grid item key={characterKey} xs={1} >
            {/* <CharacterCard key={characterKey} hideStats characterKey={characterKey} onClick={() => { onHide(); onSelect?.(characterKey) }} /> */}
            <SelectionCard characterKey={characterKey} onClick={() => { onHide(); onSelect?.(characterKey) }} />
          </Grid>)}
        </Grid></CardContent>
      </DataContext.Provider>
    </CardDark>
  </ModalWrapper>
}

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
  },
});

function SelectionCard({ characterKey, onClick }: { characterKey: CharacterKey, onClick: () => void }) {
  const { database } = useContext(DatabaseContext)
  const gender = useGender(database)
  const characterSheet = usePromise(() => CharacterSheet.get(characterKey, gender), [characterKey, gender])
  const character = useCharacter(characterKey)
  const { level = 1, ascension = 0, constellation = 0 } = character ?? {}
  return <CustomTooltip arrow placement="bottom" title={
    <Box sx={{ width: 300 }}>
      <CharacterCard hideStats characterKey={characterKey} />
    </Box>
  }>
    <Box>
      <CardLight sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <CardActionArea onClick={onClick}>
          <Box display="flex"
            position="relative"
            className={`grad-${characterSheet?.rarity}star`}
            sx={{
              "&::before": {
                content: '""',
                display: "block", position: "absolute",
                left: 0, top: 0,
                width: "100%", height: "100%",
                opacity: 0.5,
                backgroundImage: `url(${characterSheet?.bannerImg})`, backgroundPosition: "center", backgroundSize: "cover",
              }
            }}
            width="100%" >
            <Box flexShrink={1} sx={{ maxWidth: { xs: "33%", lg: "30%" } }} alignSelf="flex-end" display="flex" flexDirection="column" zIndex={1}>
              <Box
                component="img"
                src={characterSheet?.thumbImg}
                width="100%"
                height="auto"
                maxWidth={256}
                sx={{ mt: "auto" }}
              />
            </Box>
            <Box flexGrow={1} sx={{ pr: 1 }} display="flex" flexDirection="column" zIndex={1} justifyContent="space-evenly">
              <Typography variant="body2" ><SqBadge color={characterSheet?.elementKey} sx={{ opacity: 0.85 }}>{characterSheet?.name}</SqBadge></Typography>
              {character ? <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box sx={{ textShadow: "0 0 5px gray" }}>
                  <Typography variant="body2" component="span" whiteSpace="nowrap" >Lv. {level}</Typography>
                  <Typography variant="body2" component="span" color="text.secondary">/{ascensionMaxLevel[ascension]}</Typography>
                </Box>
                <Typography variant="body2" >C{constellation}</Typography>
              </Box> : <Typography component="span" variant="body2" ><SqBadge>NEW</SqBadge></Typography>}
              <Typography variant="body2" ><StarsDisplay stars={characterSheet?.rarity ?? 1} colored /></Typography>
            </Box>
          </Box>
        </CardActionArea>
      </CardLight>
    </Box>
  </CustomTooltip>
}
