import { Box, CardActionArea, CardContent, Divider, Grid, Typography } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import Assets from "../../Assets/Assets";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import { uiInput as input } from "../../Formula";
import usePromise from "../../ReactHooks/usePromise";
import useTeamData from "../../ReactHooks/useTeamData";
import { ICachedCharacter } from "../../Types/character_WR";
import { allCharacterKeys, CharacterKey, ElementKey, WeaponTypeKey } from "../../Types/consts";
import { characterFilterConfigs, characterSortConfigs } from "../../Util/CharacterSort";
import { filterFunction, sortFunction } from "../../Util/SortByFilters";
import CardDark from "../Card/CardDark";
import CardLight from "../Card/CardLight";
import CloseButton from "../CloseButton";
import ImgIcon from "../Image/ImgIcon";
import ModalWrapper from "../ModalWrapper";
import SortByButton from "../SortByButton";
import SqBadge from "../SqBadge";
import { Stars } from "../StarDisplay";
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

  const [sortBy, setsortBy] = useState(sortKeys[0])
  const [ascending, setascending] = useState(false)
  const [elementalFilter, setelementalFilter] = useState<ElementKey | "">("")
  const [weaponFilter, setweaponFilter] = useState<WeaponTypeKey | "">("")

  const characterSheets = usePromise(CharacterSheet.getAll, [])

  const sortConfigs = useMemo(() => characterSheets && characterSortConfigs(database, characterSheets), [database, characterSheets])
  const filterConfigs = useMemo(() => characterSheets && characterFilterConfigs(characterSheets), [characterSheets])
  const characterKeyList = useMemo(() => (characterSheets && sortConfigs && filterConfigs) ?
    [...new Set(allCharacterKeys)].filter(cKey => filter(database._getChar(cKey), characterSheets[cKey]))
      .filter(filterFunction({ element: elementalFilter, weaponType: weaponFilter }, filterConfigs))
      .sort(sortFunction(sortBy, ascending, sortConfigs) as (a: CharacterKey, b: CharacterKey) => number) : [],
    [database, characterSheets, filter, elementalFilter, weaponFilter, sortBy, ascending, sortConfigs, filterConfigs])

  if (!characterSheets) return null
  return <ModalWrapper open={show} onClose={onHide} >
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container spacing={1} >
          <Grid item>
            <WeaponToggle sx={{ height: "100%" }} onChange={setweaponFilter} value={weaponFilter} size="small" />
          </Grid>
          <Grid item flexGrow={1}>
            <ElementToggle sx={{ height: "100%" }} onChange={setelementalFilter} value={elementalFilter} size="small" />
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
          <CharacterBtn key={characterKey} characterKey={characterKey} onClick={() => { onHide(); onSelect?.(characterKey) }} />
        </Grid>)}
      </Grid></CardContent>
    </CardDark>
  </ModalWrapper>
}

function CharacterBtn({ onClick, characterKey }: { onClick: () => void, characterKey: CharacterKey }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const teamData = useTeamData(characterKey)
  const { target: data } = teamData?.[characterKey] ?? {}
  if (!characterSheet) return null
  const rarity = characterSheet.rarity
  return <CardActionArea onClick={onClick} >
    <CardLight sx={{ display: "flex", alignItems: "center" }}  >
      <Box component="img" src={characterSheet.thumbImg} sx={{ width: 130, height: "auto" }} className={`grad-${rarity}star`} />
      <Box sx={{ pl: 1 }}>
        <Typography><strong>{characterSheet.name}</strong></Typography>
        {data ? <>
          <Typography variant="h6"> {characterSheet.elementKey && StatIcon[characterSheet.elementKey]} <ImgIcon src={Assets.weaponTypes?.[characterSheet.weaponTypeKey]} />{` `}{CharacterSheet.getLevelString(data.get(input.lvl).value, data.get(input.asc).value)}</Typography>
          <Typography >
            <SqBadge color="success">{`C${data.get(input.constellation).value}`}</SqBadge>{` `}
            <SqBadge color={data.get(input.bonus.auto).value ? "info" : "secondary"}><strong >{data.get(input.total.auto).value}</strong></SqBadge>{` `}
            <SqBadge color={data.get(input.bonus.skill).value ? "info" : "secondary"}><strong >{data.get(input.total.skill).value}</strong></SqBadge>{` `}
            <SqBadge color={data.get(input.bonus.burst).value ? "info" : "secondary"}><strong >{data.get(input.total.burst).value}</strong></SqBadge>
          </Typography>
        </> : <>
          <Typography variant="h6"><SqBadge color="primary">NEW</SqBadge></Typography>
        </>}
        <small><Stars stars={rarity} colored /></small>
      </Box>
    </CardLight>
  </CardActionArea >
}
