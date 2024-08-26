import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import type { SvgIconProps } from '@mui/material'
import {
  BodyIcon,
  FeetIcon,
  HandsIcon,
  HeadIcon,
  RopeIcon,
  SphereIcon,
} from '../'

export function SlotIcon({
  slotKey,
  iconProps = {},
}: {
  slotKey: RelicSlotKey
  iconProps?: SvgIconProps
}) {
  switch (slotKey) {
    case 'head':
      return <HeadIcon {...iconProps} />
    // TODO: change to 'hands' when slotKey name gets changed
    case 'hand':
      return <HandsIcon {...iconProps} />
    case 'body':
      return <BodyIcon {...iconProps} />
    case 'feet':
      return <FeetIcon {...iconProps} />
    case 'sphere':
      return <SphereIcon {...iconProps} />
    case 'rope':
      return <RopeIcon {...iconProps} />
  }
}
