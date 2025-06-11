import type { AttributeKey } from '@genshin-optimizer/zzz/consts'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
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
  SheerForceIcon,
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
    case 'cond_hp':
    case 'cond_hp_':
    case 'initial_hp':
    case 'final_hp':
      return <HPIcon {...iconProps} />
    case 'atk':
    case 'atk_':
    case 'atk_base':
    case 'cond_atk':
    case 'cond_atk_':
    case 'initial_atk':
    case 'final_atk':
      return <AtkIcon {...iconProps} />
    case 'def':
    case 'def_':
    case 'def_base':
    case 'cond_def':
    case 'cond_def_':
    case 'initial_def':
    case 'final_def':
      return <DefIcon {...iconProps} />
    case 'crit_':
      return <CritIcon {...iconProps} />
    case 'crit_dmg_':
      return <CritDmgIcon {...iconProps} />
    case 'enerRegen_':
      return <EnerRegenIcon {...iconProps} />
    case 'anomMas':
    case 'anomMas_':
    case 'anomMas_base':
    case 'cond_anomMas':
    case 'cond_anomMas_':
    case 'final_anomMas':
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
    case 'sheerForce':
      return <SheerForceIcon {...iconProps} />
  }

  const ele = statKey.split('_')[0]
  if (allAttributeKeys.includes(ele as AttributeKey))
    return <ElementIcon ele={ele as AttributeKey} iconProps={iconProps} />

  return null
}
