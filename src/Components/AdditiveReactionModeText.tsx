import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AdditiveReactionKey } from "../Types/consts";
import ColorText from "./ColoredText";
import SqBadge from "./SqBadge";
import StatIcon from "./StatIcon";

const sqBadgeStyle = { mx: 0.25, px: 0.25 }
export default function AdditiveReactionModeText({ reaction }: { reaction: AdditiveReactionKey }) {
  const { t } = useTranslation("sheet_gen")

  const trigger = (reaction === "spread" ? "dendro" : "electro")

  return <Box display="flex" alignItems="center">
    <ColorText color={reaction}>{t(`reaction.${reaction}`)}</ColorText>
    <SqBadge sx={sqBadgeStyle} color={"dendro"}>{StatIcon.dendro}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color={"electro"}>{StatIcon.electro}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color={trigger}>{StatIcon[trigger]}</SqBadge>
  </Box>
}
