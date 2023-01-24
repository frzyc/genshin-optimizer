import { characterAsset } from "@genshin-optimizer/g-assets"
import { Typography } from "@mui/material"
import { getCharSheet } from "../../Data/Characters"
import useDBMeta from "../../ReactHooks/useDBMeta"
import { CharacterKey } from "../../Types/consts"
import BootstrapTooltip from "../BootstrapTooltip"
import ImgIcon from "../Image/ImgIcon"

export default function LocationIcon({ characterKey }: { characterKey: CharacterKey }) {
  const { gender } = useDBMeta()
  const characterSheet =  getCharSheet(characterKey, gender)
  if (!characterSheet) return null
  return <BootstrapTooltip placement="right-end" title={<Typography>{characterSheet.name}</Typography>}>
    <ImgIcon src={characterAsset(characterKey, "iconSide", gender)} size={2.5} sx={{ marginTop: "-1.5em", marginLeft: "-0.5em" }} />
  </BootstrapTooltip>
}
