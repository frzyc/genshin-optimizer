import type { PathKey } from '@genshin-optimizer/sr/consts'
import type { SvgIconProps } from '@mui/material'
import {
  AbundanceIcon,
  DestructionIcon,
  EruditionIcon,
  HarmonyIcon,
  NihilityIcon,
  PreservationIcon,
  TheHuntIcon,
} from '..'

export function PathIcon({
  pathKey,
  iconProps = {},
}: {
  pathKey: PathKey
  iconProps?: SvgIconProps
}) {
  switch (pathKey) {
    case 'Abundance':
      return <AbundanceIcon {...iconProps} />
    case 'Destruction':
      return <DestructionIcon {...iconProps} />
    case 'Erudition':
      return <EruditionIcon {...iconProps} />
    case 'Harmony':
      return <HarmonyIcon {...iconProps} />
    case 'Nihility':
      return <NihilityIcon {...iconProps} />
    case 'Preservation':
      return <PreservationIcon {...iconProps} />
    case 'TheHunt':
      return <TheHuntIcon {...iconProps} />
    case 'Remembrance':
      // TODO: Get a real icon
      return <TheHuntIcon {...iconProps} />
  }
}
