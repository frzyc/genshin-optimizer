import { MainStatKey, SubstatKey } from "@genshin-optimizer/pipeline"
import { Box } from "@mui/material"
import { useTranslation } from "react-i18next"
import { artStatPercent } from "../../Data/Artifacts/Artifact"
import KeyMap from "../../KeyMap"
import StatIcon from "../../KeyMap/StatIcon"
import { iconInlineProps } from "../../SVGIcons"
import ColorText from "../ColoredText"

// Special consideration for artifact stats, because in general only hp_, atk_ and def_ gets a percentage when displaying.

export function ArtifactStatWithUnit({ statKey }: { statKey: MainStatKey | SubstatKey }) {
  const { t: tk } = useTranslation("statKey_gen")
  return <span>{tk(statKey)}{artStatPercent(statKey)}</span>
}
export function ArtifactIconStatWithUnit({ statKey, disableIcon = false }: { statKey: MainStatKey | SubstatKey, disableIcon?: boolean }) {
  return <Box component="span" display="flex" alignItems="center" gap={1}>{!disableIcon && <StatIcon statKey={statKey} iconProps={iconInlineProps} />}<ArtifactStatWithUnit statKey={statKey} /></Box>
}

export function ArtifactColoredIconStatWithUnit({ statKey, disableIcon = false }: { statKey: MainStatKey | SubstatKey, disableIcon?: boolean }) {
  return <ColorText color={KeyMap.getVariant(statKey)}><ArtifactIconStatWithUnit statKey={statKey} disableIcon={disableIcon} /></ColorText>
}
