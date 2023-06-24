import type { ArtifactSlotKey } from '@genshin-optimizer/consts'
import {
  CircletIcon,
  FlowerIcon,
  GobletIcon,
  PlumeIcon,
  SandsIcon,
} from '@genshin-optimizer/gi-svgicons'
import type { SvgIconProps } from '@mui/material'

export default function SlotIcon({
  slotKey,
  iconProps = {},
}: {
  slotKey: ArtifactSlotKey
  iconProps?: SvgIconProps
}) {
  switch (slotKey) {
    case 'flower':
      return <FlowerIcon {...iconProps} />
    case 'plume':
      return <PlumeIcon {...iconProps} />
    case 'sands':
      return <SandsIcon {...iconProps} />
    case 'goblet':
      return <GobletIcon {...iconProps} />
    case 'circlet':
      return <CircletIcon {...iconProps} />
  }
}
