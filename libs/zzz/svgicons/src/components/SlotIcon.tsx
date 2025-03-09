import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { SvgIconProps } from '@mui/material'
import {
  Slot1Icon,
  Slot2Icon,
  Slot3Icon,
  Slot4Icon,
  Slot5Icon,
  Slot6Icon,
} from '../icons'

export function SlotIcon({
  slotKey,
  iconProps = {},
}: {
  slotKey: DiscSlotKey
  iconProps?: SvgIconProps
}) {
  switch (slotKey) {
    case '1':
      return <Slot1Icon {...iconProps} />
    case '2':
      return <Slot2Icon {...iconProps} />
    case '3':
      return <Slot3Icon {...iconProps} />
    case '4':
      return <Slot4Icon {...iconProps} />
    case '5':
      return <Slot5Icon {...iconProps} />
    case '6':
      return <Slot6Icon {...iconProps} />
  }
}
