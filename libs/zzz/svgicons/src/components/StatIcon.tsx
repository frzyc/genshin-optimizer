import type { ElementalKey } from '@genshin-optimizer/zzz/consts'
import { allElementalKeys } from '@genshin-optimizer/zzz/consts'
import type { SvgIconProps } from '@mui/material'
import {
  AnomMasIcon,
  AnomProfIcon,
  AtkIcon,
  CritDmgIcon,
  CritIcon,
  DefIcon,
  EnerRegenIcon,
  HPIcon,
  ImpactIcon,
  PenIcon,
  PenRatioIcon,
} from '../icons'
import { ElementIcon } from './ElementIcon'

export function StatIcon({
  statKey,
  iconProps = {},
}: {
  statKey: string
  iconProps?: SvgIconProps
}) {
  switch (statKey) {
    case 'hp':
    case 'hp_':
    case 'hp_base':
      return <HPIcon {...iconProps} />
    case 'atk':
    case 'atk_':
    case 'atk_base':
      return <AtkIcon {...iconProps} />
    case 'def':
    case 'def_':
    case 'def_base':
      return <DefIcon {...iconProps} />
    case 'crit_':
      return <CritIcon {...iconProps} />
    case 'crit_dmg_':
      return <CritDmgIcon {...iconProps} />
    case 'enerRegen_':
      return <EnerRegenIcon {...iconProps} />
    case 'anomMas_':
      return <AnomMasIcon {...iconProps} />
    case 'anomProf':
      return <AnomProfIcon {...iconProps} />
    case 'impact':
    case 'impact_':
      return <ImpactIcon {...iconProps} />
    case 'pen':
      return <PenIcon {...iconProps} />
    case 'pen_':
      return <PenRatioIcon {...iconProps} />
  }

  const ele = statKey.split('_')[0]
  if (allElementalKeys.includes(ele as ElementalKey))
    return <ElementIcon ele={ele as ElementalKey} iconProps={iconProps} />

  return null
}
