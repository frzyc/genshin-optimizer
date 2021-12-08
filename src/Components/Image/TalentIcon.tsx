import { styled } from "@mui/system"
import { ElementKey } from "../../Types/consts"

interface TalentIconProps {
  element: ElementKey;
}
const TalentIcon = styled("img", {
  name: 'TalentIcon',
  slot: 'Root',
})<TalentIconProps>(({ theme, element }) => ({
  backgroundImage: `linear-gradient(${theme.palette[element].light},${theme.palette[element].dark})`,
  borderRadius: "50%"
}))
export default TalentIcon