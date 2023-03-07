import { allArtifactSlotKeys, ArtifactSlotKey } from "@genshin-optimizer/consts"
import { Replay } from "@mui/icons-material"
import { ButtonProps, Divider, ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import { useTranslation } from "react-i18next"
import DropdownButton from "../DropdownMenu/DropdownButton"
import SlotIcon from "./SlotIcon"

type ArtifactSlotDropdownProps = ButtonProps & {
  slotKey?: ArtifactSlotKey | ""
  onChange: (slotKey: ArtifactSlotKey | "") => void
  hasUnselect?: boolean
}

export default function ArtifactSlotDropdown({ slotKey = "", onChange, hasUnselect = false, ...props }: ArtifactSlotDropdownProps) {
  const { t } = useTranslation(["artifact", "ui"]);
  return <DropdownButton
    title={slotKey ? t(`artifact:slotName:${slotKey}`) : t('artifact:slot')}
    color={slotKey ? "success" : "primary"}
    startIcon={slotKey ? <SlotIcon slotKey={slotKey} /> : undefined}
    {...props}
  >
    {hasUnselect && <MenuItem selected={slotKey === ""} disabled={slotKey === ""} onClick={() => onChange("")} >
      <ListItemIcon>
        <Replay />
      </ListItemIcon>
      <ListItemText>
        {t`ui:unselect`}
      </ListItemText>
    </MenuItem>}
    {hasUnselect && <Divider />}
    {allArtifactSlotKeys.map(key =>
      <MenuItem key={key} selected={slotKey === key} disabled={slotKey === key} onClick={() => onChange(key)} >
        <ListItemIcon>
          <SlotIcon slotKey={key} />
        </ListItemIcon>
        <ListItemText>
          {t(`artifact:slotName:${key}`)}
        </ListItemText>
      </MenuItem>)}
  </DropdownButton>
}
