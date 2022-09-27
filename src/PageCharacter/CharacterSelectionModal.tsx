import { Box, CardActionArea, CardContent, Divider, Grid, TextField, Tooltip, tooltipClasses, TooltipProps, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { ChangeEvent, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
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
import useDBMeta from "../ReactHooks/useDBMeta";
import useForceUpdate from "../ReactHooks/useForceUpdate";
import usePromise from "../ReactHooks/usePromise";
import { ICachedCharacter } from "../Types/character";
import { allCharacterKeys, CharacterKey } from "../Types/consts";
import { characterFilterConfigs, characterSortConfigs, CharacterSortKey, characterSortMap } from "../Util/CharacterSort";
import { filterFunction, sortFunction } from "../Util/SortByFilters";

type characterFilter = (character: ICachedCharacter | undefined, sheet: CharacterSheet) => boolean

type CharacterSelectionModalProps = {
  show: boolean,
  newFirst?: boolean
  onHide: () => void,
  onSelect?: (ckey: CharacterKey) => void,
  filter?: characterFilter
}
const sortKeys = Object.keys(characterSortMap)
export function CharacterSelectionModal({ show, onHide, onSelect, filter = () => true, newFirst = false }: CharacterSelectionModalProps) {
  const { t } = useTranslation(["page_character", "charNames_gen"])
  const { database } = useContext(DatabaseContext)
  const [state, setState] = useState(() => database.displayCharacter.get())
  useEffect(() => database.displayCharacter.follow((r, s) => setState(s)), [database, setState])

  const characterSheets = usePromise(() => CharacterSheet.getAll, [])

  const [dbDirty, forceUpdate] = useForceUpdate()

  // character favorite updater
  useEffect(() => database.charMeta.followAny(s => forceUpdate()), [forceUpdate, database])

  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const deferredState = useDeferredValue(state)
  const deferredDbDirty = useDeferredValue(dbDirty)
  const characterKeyList = useMemo(() => {
    if (!characterSheets) return []
    const { element, weaponType, sortType, ascending } = deferredState
    const sortByKeys = [...(newFirst ? ["new"] : []), ...(characterSortMap[sortType] ?? [])] as CharacterSortKey[]
    return deferredDbDirty && allCharacterKeys
      .filter(filterFunction({ element, weaponType, name: deferredSearchTerm }, characterFilterConfigs(database, characterSheets)))
      .sort(sortFunction(sortByKeys, ascending, characterSortConfigs(database, characterSheets), ["new", "favorite"]))
  }, [database, newFirst, deferredState, characterSheets, deferredDbDirty, deferredSearchTerm])

  if (!characterSheets) return null

  const { weaponType, element, sortType, ascending } = state

  return <ModalWrapper open={show} onClose={onHide} sx={{ "& .MuiContainer-root": { justifyContent: "normal" } }}>
    <CardDark>
      <CardContent sx={{ py: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => database.displayCharacter.set({ weaponType })} value={weaponType} size="small" />
        <ElementToggle sx={{ height: "100%" }} onChange={element => database.displayCharacter.set({ element })} value={element} size="small" />
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
          sortKeys={sortKeys} value={sortType} onChange={sortType => database.displayCharacter.set({ sortType })}
          ascending={ascending} onChangeAsc={ascending => database.displayCharacter.set({ ascending })} />
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
  const { gender } = useDBMeta()
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
              <Typography variant="body2" ><SqBadge color={characterSheet?.elementKey} sx={{ opacity: 0.85, textShadow: "0 0 5px gray" }}>{characterSheet?.name}</SqBadge></Typography>
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
