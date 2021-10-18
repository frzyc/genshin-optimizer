import { Box, CardActionArea, CardContent, Divider, Grid, Typography } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import { ArtifactSheet } from "../../Artifact/ArtifactSheet";
import Assets from "../../Assets/Assets";
import Character from '../../Character/Character';
import CharacterSheet from "../../Character/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import usePromise from "../../ReactHooks/usePromise";
import { ICachedCharacter } from "../../Types/character";
import { allCharacterKeys, CharacterKey, ElementKey, WeaponTypeKey } from "../../Types/consts";
import characterSortOptions from "../../Util/CharacterSort";
import SortByFilters from "../../Util/SortByFilters";
import WeaponSheet from "../../Weapon/WeaponSheet";
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
  const database = useContext(DatabaseContext)

  const [sortBy, setsortBy] = useState(sortKeys[0])
  const [ascending, setascending] = useState(false)
  const [elementalFilter, setelementalFilter] = useState<ElementKey | "">("")
  const [weaponFilter, setweaponFilter] = useState<WeaponTypeKey | "">("")

  const characterSheets = usePromise(CharacterSheet.getAll(), [])

  const sortOptions = useMemo(() => characterSheets && characterSortOptions(database, characterSheets), [database, characterSheets])
  const characterKeyList = useMemo(() => characterSheets && sortOptions ? [...new Set(allCharacterKeys)].filter(cKey => filter(database._getChar(cKey), characterSheets[cKey])).filter(cKey => {
    if (elementalFilter && elementalFilter !== characterSheets?.[cKey]?.elementKey) return false
    if (weaponFilter && weaponFilter !== characterSheets?.[cKey]?.weaponTypeKey) return false
    return true
  }).sort(SortByFilters(sortBy, ascending, sortOptions) as (a: CharacterKey, b: CharacterKey) => number) : [],
    [database, characterSheets, filter, elementalFilter, weaponFilter, sortBy, ascending, sortOptions])

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

function CharacterBtn({ onClick, characterKey }) {
  const database = useContext(DatabaseContext)
  const character = database._getChar(characterKey)
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const weapon = character?.equippedWeapon ? database._getWeapon(character.equippedWeapon) : undefined
  const weaponSheet = usePromise(weapon ? WeaponSheet.get(weapon.key) : undefined, [weapon?.key])
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const stats = useMemo(() => character && characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, database, characterSheet, weaponSheet, artifactSheets), [character, characterSheet, weaponSheet, artifactSheets, database])
  if (!characterSheet) return null
  const rarity = characterSheet.star
  return <CardActionArea onClick={onClick} >
    <CardLight sx={{ display: "flex", alignItems: "center" }}  >
      <Box component="img" src={characterSheet.thumbImg} sx={{ width: 130, height: "auto" }} className={`grad-${rarity}star`} />
      <Box sx={{ pl: 1 }}>
        <Typography><strong>{characterSheet.name}</strong></Typography>
        {stats && character ? <>
          <Typography variant="h6"> {characterSheet.elementKey && StatIcon[characterSheet.elementKey]} <ImgIcon src={Assets.weaponTypes?.[characterSheet.weaponTypeKey]} />{` `}{Character.getLevelString(character)}</Typography>
          <Typography >
            <SqBadge color="success">{`C${character.constellation}`}</SqBadge>{` `}
            <SqBadge color="secondary"><strong >{stats.tlvl.auto + 1}</strong></SqBadge>{` `}
            <SqBadge color={stats.skillBoost ? "info" : "secondary"}><strong >{stats.tlvl.skill + 1}</strong></SqBadge>{` `}
            <SqBadge color={stats.burstBoost ? "info" : "secondary"}><strong >{stats.tlvl.burst + 1}</strong></SqBadge>
          </Typography>
        </> : <>
          <Typography variant="h6"><SqBadge color="primary">NEW</SqBadge></Typography>
        </>}
        <small><Stars stars={characterSheet.star} colored /></small>
      </Box>
    </CardLight>
  </CardActionArea >
}