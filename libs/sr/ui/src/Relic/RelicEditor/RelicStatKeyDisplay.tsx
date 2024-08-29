import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type {
  RelicMainStatKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { statPercent } from '../util'

// Special consideration for relic stats, by displaying % behind hp_, atk_ and def_.
export function RelicStatWithUnit({
  statKey,
}: {
  statKey: RelicMainStatKey | RelicSubStatKey
}) {
  const { t: tk } = useTranslation('statKey_gen')
  return (
    <span>
      {tk(statKey)}
      {statPercent(statKey)}
    </span>
  )
}
export function RelicIconStatWithUnit({
  statKey,
  disableIcon = false,
}: {
  statKey: RelicMainStatKey | RelicSubStatKey
  disableIcon?: boolean
}) {
  return (
    <Box component="span" display="flex" alignItems="center" gap={1}>
      {!disableIcon && (
        <StatIcon statKey={statKey} iconProps={iconInlineProps} />
      )}
      <RelicStatWithUnit statKey={statKey} />
    </Box>
  )
}

// TODO: find alternative to KeyMap from WR to use for grabbing color programmatically
// export function RelicColoredIconStatWithUnit({
//   statKey,
//   disableIcon = false,
// }: {
//   statKey: MainStatKey | SubstatKey
//   disableIcon?: boolean
// }) {
//   return (
//     <ColorText color={KeyMap.getVariant(statKey)}>
//       <RelicIconStatWithUnit statKey={statKey} disableIcon={disableIcon} />
//     </ColorText>
//   )
// }
