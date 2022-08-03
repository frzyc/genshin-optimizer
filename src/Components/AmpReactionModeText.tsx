import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Variant } from "../Formula/type";
import { AmpReactionKey } from "../Types/consts";
import ColorText from "./ColoredText";
import SqBadge from "./SqBadge";
import { uncoloredEleIcons } from "./StatIcon";

export const ampReactionMap = {
  melt: {
    cryo: ["pyro", "cryo"],
    pyro: ["cryo", "pyro"],
  },
  vaporize: {
    hydro: ["pyro", "hydro"],
    pyro: ["hydro", "pyro"],
  }
} as const
const sqBadgeStyle = { mx: 0.25, px: 0.25 }
export default function AmpReactionModeText({ reaction, subvariant }: { reaction: AmpReactionKey, subvariant?: Variant }) {
  const { t } = useTranslation("page_character")
  if (!subvariant) subvariant = Object.keys(ampReactionMap[reaction])[0]
  const eles = ampReactionMap[reaction][subvariant]
  if (!eles) return null;
  const [base, trigger] = eles

  return <Box display="flex" alignItems="center">
    <ColorText color="melt">{t(`ampReaction.${reaction}`)}</ColorText>
    <SqBadge sx={sqBadgeStyle} color={base}>{uncoloredEleIcons[base]}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color={trigger}>{uncoloredEleIcons[trigger]}</SqBadge>
  </Box>
}
