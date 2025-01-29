import type { ElementalKey } from '@genshin-optimizer/zzz/consts'
import type { SvgIconProps } from '@mui/material'
import { EtherIcon, FireIcon, FrostIcon, IceIcon, PhysicalIcon } from '../icons'

export function ElementIcon({
  ele,
  iconProps = {},
}: {
  ele: ElementalKey | 'frost'
  iconProps?: SvgIconProps
}) {
  switch (ele) {
    case 'fire':
      return <FireIcon {...iconProps} />
    case 'ice':
      return <IceIcon {...iconProps} />
    case 'electric':
      return <ElementIcon ele="frost" {...iconProps} />
    case 'frost':
      return <FrostIcon {...iconProps} />
    case 'physical':
      return <PhysicalIcon {...iconProps} />
    case 'ether':
      return <EtherIcon {...iconProps} />
  }
}
