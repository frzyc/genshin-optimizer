import { iconInlineProps } from '@genshin-optimizer/common_svgicons'
import { ColorText } from '@genshin-optimizer/common_ui'
import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi_consts'
import { StatIcon } from '@genshin-optimizer/gi_svgicons'
import { getVariant } from '@genshin-optimizer/gi_ui'
import { artStatPercent } from '@genshin-optimizer/gi_util'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

// Special consideration for artifact stats, because in general only hp_, atk_ and def_ gets a percentage when displaying.
export function ArtifactStatWithUnit({
  statKey,
}: {
  statKey: MainStatKey | SubstatKey
}) {
  const { t: tk } = useTranslation('statKey_gen')
  return (
    <span>
      {tk(statKey)}
      {artStatPercent(statKey)}
    </span>
  )
}
export function ArtifactIconStatWithUnit({
  statKey,
  disableIcon = false,
}: {
  statKey: MainStatKey | SubstatKey
  disableIcon?: boolean
}) {
  return (
    <Box component="span" display="flex" alignItems="center" gap={1}>
      {!disableIcon && (
        <StatIcon statKey={statKey} iconProps={iconInlineProps} />
      )}
      <ArtifactStatWithUnit statKey={statKey} />
    </Box>
  )
}

export function ArtifactColoredIconStatWithUnit({
  statKey,
  disableIcon = false,
}: {
  statKey: MainStatKey | SubstatKey
  disableIcon?: boolean
}) {
  return (
    <ColorText color={getVariant(statKey)}>
      <ArtifactIconStatWithUnit statKey={statKey} disableIcon={disableIcon} />
    </ColorText>
  )
}
