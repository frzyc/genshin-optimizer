import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Variant } from "../Formula/type";
import { AmpReactionKey } from "../Types/consts";
import ColorText from "./ColoredText";
import SqBadge from "./SqBadge";
import StatIcon from "./StatIcon";

export const ampReactionMap = {
  melt: {
    cryo: "pyro",
    pyro: "cryo",
  },
  vaporize: {
    hydro: "pyro",
    pyro: "hydro",
  }
} as const
const sqBadgeStyle = { mx: 0.25, px: 0.25 }
export default function AmpReactionModeText({ reaction, trigger }: { reaction: AmpReactionKey, trigger?: Variant }) {
  const { t } = useTranslation("sheet_gen")
  if (!trigger) trigger = Object.keys(ampReactionMap[reaction])[0]
  const base = ampReactionMap[reaction][trigger]
  if (!base) return null;

  return <Box display="flex" alignItems="center">
    <ColorText color="melt">{t(`reaction.${reaction}`)}</ColorText>
    <SqBadge sx={sqBadgeStyle} color={base}>{StatIcon[base]}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color={trigger as "cryo" | "pyro" | "hydro"}>{StatIcon[trigger]}</SqBadge>
  </Box>
}
