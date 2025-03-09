import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { SvgIconProps } from '@mui/material'
import {
  SlotFiveIcon,
  SlotFourIcon,
  SlotOneIcon,
  SlotSixIcon,
  SlotThreeIcon,
  SlotTwoIcon,
} from '../icons'

export function SlotIcon({
  slotKey,
  iconProps = {},
}: {
  slotKey: DiscSlotKey
  iconProps?: SvgIconProps
}) {
  console.log(slotKey)
  switch (slotKey) {
    case '1':
      return <SlotOneIcon {...iconProps} />
    case '2':
      return <SlotTwoIcon {...iconProps} />
    case '3':
      return <SlotThreeIcon {...iconProps} />
    case '4':
      return <SlotFourIcon {...iconProps} />
    case '5':
      return <SlotFiveIcon {...iconProps} />
    case '6':
      return <SlotSixIcon {...iconProps} />
  }
}
