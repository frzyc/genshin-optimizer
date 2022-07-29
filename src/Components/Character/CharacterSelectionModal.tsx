import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Box, CardActionArea, CardContent, Divider, Grid, IconButton, Skeleton, TextField, Typography } from "@mui/material";
import { ChangeEvent, Suspense, useContext, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Assets from "../../Assets/Assets";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import { uiInput as input } from "../../Formula";
import useDBState from "../../ReactHooks/useDBState";
import useForceUpdate from "../../ReactHooks/useForceUpdate";
import usePromise from "../../ReactHooks/usePromise";
import useTeamData from "../../ReactHooks/useTeamData";
import { initCharMeta } from "../../stateInit";
import { ICachedCharacter } from "../../Types/character";
import { allCharacterKeys, allElements, allWeaponTypeKeys, CharacterKey } from "../../Types/consts";
import { characterFilterConfigs, characterSortConfigs } from "../../Util/CharacterSort";
import { filterFunction, sortFunction } from "../../Util/SortByFilters";
import CardDark from "../Card/CardDark";
import CardLight from "../Card/CardLight";
import CloseButton from "../CloseButton";
import ImgIcon from "../Image/ImgIcon";
import ModalWrapper from "../ModalWrapper";
import SortByButton from "../SortByButton";
import SqBadge from "../SqBadge";
import { StarsDisplay } from "../StarDisplay";
import StatIcon from "../StatIcon";
import ElementToggle from "../ToggleButton/ElementToggle";
import WeaponToggle from "../ToggleButton/WeaponToggle";

const defaultSortKeys = ["level", "rarity", "name"]

type characterFilter = (character: ICachedCharacter | undefined, sheet: CharacterSheet) => boolean

type CharacterSelectionModalProps = {
  show: boolean,
  newFirst?: boolean
  onHide: () => void,
  onSelect?: (ckey: CharacterKey) => void,
  filter?: characterFilter
}

export function CharacterSelectionModal({ show, onHide, onSelect, filter = () => true, newFirst = false }: CharacterSelectionModalProps) {
  const sortKeys = useMemo(() => newFirst ? ["new", ...defaultSortKeys] : defaultSortKeys, [newFirst])
  const { database } = useContext(DatabaseContext)
  const { t } = useTranslation(["page_character", "charNames_gen"])

  const [sortBy, setsortBy] = useState(sortKeys[0])
  const [ascending, setascending] = useState(false)
  const [elementalFilter, setelementalFilter] = useState([...allElements])
  const [weaponFilter, setweaponFilter] = useState([...allWeaponTypeKeys])

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
      .filter(filterFunction({ element: elementalFilter, weaponType: weaponFilter, favorite: "yes", name: deferredSearchTerm }, filterConfigs))
      .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number)
      .concat(
        ownedCharacterKeyList
          .filter(filterFunction({ element: elementalFilter, weaponType: weaponFilter, favorite: "no", name: deferredSearchTerm }, filterConfigs))
          .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number)
      )
    : [],
    [characterSheets, elementalFilter, weaponFilter, sortBy, ascending, sortConfigs, filterConfigs, ownedCharacterKeyList, deferredSearchTerm])

  if (!characterSheets) return null
  return <ModalWrapper open={show} onClose={onHide} sx={{ "& .MuiContainer-root": { justifyContent: "normal" } }}>
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container spacing={1} >
          <Grid item>
            <WeaponToggle sx={{ height: "100%" }} onChange={setweaponFilter} value={weaponFilter} size="small" />
          </Grid>
          <Grid item>
            <ElementToggle sx={{ height: "100%" }} onChange={setelementalFilter} value={elementalFilter} size="small" />
          </Grid>
          <Grid item>
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

          <Grid item flexGrow={1} />

          <Grid item >
            <SortByButton sx={{ height: "100%" }}
              sortKeys={sortKeys} value={sortBy} onChange={setsortBy as any}
              ascending={ascending} onChangeAsc={setascending} />
          </Grid>
          <Grid item>
            <CloseButton onClick={onHide} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent><Grid container spacing={1}>
        {characterKeyList.map(characterKey => <Grid item key={characterKey} xs={6} md={4} lg={3} >
          <CharacterBtn key={characterKey} characterKey={characterKey} characterSheet={characterSheets[characterKey]} onClick={() => { onHide(); onSelect?.(characterKey) }} />
        </Grid>)}
      </Grid></CardContent>
    </CardDark>
  </ModalWrapper>
}

function CharacterBtn({ onClick, characterKey, characterSheet }: { onClick: () => void, characterKey: CharacterKey, characterSheet: CharacterSheet }) {
  const teamData = useTeamData(characterKey)
  const { target: data } = teamData?.[characterKey] ?? {}
  const rarity = characterSheet.rarity
  const [{ favorite }, setCharMeta] = useDBState(`charMeta_${characterKey}`, initCharMeta)
  return <Suspense fallback={<Skeleton variant="rectangular" height={130} />}><Box>
    {favorite !== undefined && <Box display="flex" position="absolute" alignSelf="start" zIndex={1}>
      <IconButton sx={{ p: 0.5 }} onClick={() => setCharMeta({ favorite: !favorite })}>
        {favorite ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
    </Box>}
    <CardActionArea onClick={onClick} >
      <CardLight sx={{ display: "flex", alignItems: "center" }}  >
        <Box component="img" src={characterSheet.thumbImg} sx={{ width: 130, height: "auto" }} className={`grad-${rarity}star`} />
        <Box sx={{ pl: 1 }}>
          <Typography><strong>{characterSheet.name}</strong></Typography>
          {data ? <>
            <Typography variant="h6" sx={{ display: "flex", gap: 0.5, alignItems: "center" }}> {characterSheet.elementKey && StatIcon[characterSheet.elementKey]} <ImgIcon src={Assets.weaponTypes?.[characterSheet.weaponTypeKey]} />{` `}{CharacterSheet.getLevelString(data.get(input.lvl).value, data.get(input.asc).value)}</Typography>
            <Typography variant="subtitle2" >
              <SqBadge color="success">{`C${data.get(input.constellation).value}`}</SqBadge>{` `}
              <SqBadge color={data.get(input.bonus.auto).value ? "info" : "secondary"}><strong >{data.get(input.total.auto).value}</strong></SqBadge>{` `}
              <SqBadge color={data.get(input.bonus.skill).value ? "info" : "secondary"}><strong >{data.get(input.total.skill).value}</strong></SqBadge>{` `}
              <SqBadge color={data.get(input.bonus.burst).value ? "info" : "secondary"}><strong >{data.get(input.total.burst).value}</strong></SqBadge>
            </Typography>
          </> : <>
            <Typography variant="h6"><SqBadge color="primary">NEW</SqBadge></Typography>
          </>}
          <small><StarsDisplay stars={rarity} colored /></small>
        </Box>
      </CardLight>
    </CardActionArea >
  </Box></Suspense>
}
