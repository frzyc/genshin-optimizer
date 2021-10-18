import { Replay } from "@mui/icons-material"
import { ButtonProps, Divider, ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import { useTranslation } from "react-i18next"
import { artifactSlotIcon } from "../../Artifact/Component/SlotNameWIthIcon"
import { allSlotKeys, SlotKey } from "../../Types/consts"
import DropdownButton from "../DropdownMenu/DropdownButton"

type ArtifactSlotDropdownProps = ButtonProps & {
  slotKey?: SlotKey | ""
  onChange: (slotKey: SlotKey | "") => void
  hasUnselect?: boolean
}

export default function ArtifactSlotDropdown({ slotKey = "", onChange, hasUnselect = false, ...props }: ArtifactSlotDropdownProps) {
  const { t } = useTranslation(["artifact", "ui"]);
  return <DropdownButton
    title={slotKey ? t(`artifact:slotName:${slotKey}`) : t('artifact:slot')}
    color={slotKey ? "success" : "primary"}
    startIcon={slotKey ? artifactSlotIcon(slotKey) : undefined}
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
    {allSlotKeys.map(key =>
      <MenuItem key={key} selected={slotKey === key} disabled={slotKey === key} onClick={() => onChange(key)} >
        <ListItemIcon>
          {artifactSlotIcon(key)}
        </ListItemIcon>
        <ListItemText>
          {t(`artifact:slotName:${key}`)}
        </ListItemText>
      </MenuItem>)}
  </DropdownButton>
}
