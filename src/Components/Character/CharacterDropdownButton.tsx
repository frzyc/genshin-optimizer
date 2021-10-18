import { BusinessCenter, Replay } from "@mui/icons-material";
import { Divider, ListItemIcon, MenuItem, Typography } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../../Character/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import usePromise from "../../ReactHooks/usePromise";
import { CharacterKey } from "../../Types/consts";
import DropdownButton, { DropdownButtonProps } from "../DropdownMenu/DropdownButton";
import ImgIcon from "../Image/ImgIcon";

export type CharacterDropdownButtonProps = Omit<DropdownButtonProps, "title" | "onChange" | "children"> & {
  value: CharacterKey | ""
  onChange: (ck: CharacterKey | "") => void
  filter?: (cs: CharacterSheet) => boolean
  inventory?: boolean
  noUnselect?: boolean
}

export default function CharacterDropdownButton({ value, onChange, inventory = false, noUnselect = false, filter = () => true, ...props }: CharacterDropdownButtonProps) {
  const { t } = useTranslation("ui");
  const database = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll(), [])
  const characterSheet = usePromise(CharacterSheet.get(value), [value])
  const characterKeys = database._getCharKeys().filter(ck => characterSheets?.[ck] && filter(characterSheets[ck])).sort()
  return <DropdownButton
    {...props}
    title={characterSheet?.name ?? (inventory ? t`inventory` : t`unselect`)}
    color={value ? "success" : "primary"}
    startIcon={characterSheet?.thumbImg ? <ImgIcon src={characterSheet.thumbImg} /> : (inventory ? <BusinessCenter /> : <Replay />)}>
    {!noUnselect && (inventory ? <MenuItem onClick={() => onChange("")} selected={value === ""} disabled={value === ""}>
      <ListItemIcon>
        <BusinessCenter />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t`inventory`}
      </Typography>
    </MenuItem> : <MenuItem onClick={() => onChange("")} selected={value === ""} disabled={value === ""}>
      <ListItemIcon>
        <Replay />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {t`unselect`}
      </Typography>
    </MenuItem>)}
    {!noUnselect && <Divider key="div" />}
    {!!characterSheets && CharacterMenuItemArray(characterSheets, characterKeys, onChange, value)}
  </DropdownButton >
}

// Returning an array instead of Fragment because MUI Menu doesn't like fragments.
export function CharacterMenuItemArray(characterSheets: StrictDict<CharacterKey, CharacterSheet>, characterKeys: CharacterKey[], onChange: (ck: CharacterKey) => void, selectedCharacterKey: CharacterKey | "" = "") {
  return characterKeys.map(characterKey =>
    <MenuItem onClick={() => onChange(characterKey)} key={characterKey} selected={selectedCharacterKey === characterKey} disabled={selectedCharacterKey === characterKey} >
      <ListItemIcon>
        <ImgIcon src={characterSheets[characterKey].thumbImg} />
      </ListItemIcon>
      <Typography variant="inherit" noWrap>
        {characterSheets?.[characterKey]?.name}
      </Typography>
    </MenuItem>)
}