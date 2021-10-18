import { ButtonProps, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ArtifactRarity } from "../../Types/consts";
import DropdownButton from "../DropdownMenu/DropdownButton";
import { Stars } from "../StarDisplay";

type props = ButtonProps & {
  rarity?: ArtifactRarity
  onChange: (rarity: ArtifactRarity) => void
  filter: (ArtifactRarity) => boolean
}

export default function ArtifactRarityDropdown({ rarity, onChange, filter, ...props }: props) {
  const { t } = useTranslation("artifact")
  return <DropdownButton
    {...props}
    title={rarity ? <Stars stars={rarity} /> : t`editor.rarity`}
    color={rarity ? "success" : "primary"}
  >
    {([5, 4, 3] as ArtifactRarity[]).map(rarity =>
      <MenuItem key={rarity} disabled={!filter(rarity)} onClick={() => onChange(rarity)}>
        <Stars stars={rarity} />
      </MenuItem>)}
  </DropdownButton>
}
