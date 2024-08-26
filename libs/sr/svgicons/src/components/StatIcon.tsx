import type { ElementalTypeKey } from '@genshin-optimizer/sr/consts'
import { allElementalTypeKeys } from '@genshin-optimizer/sr/consts'
import type { SvgIconProps } from '@mui/material'
import {
  AtkIcon,
  BrEffIcon,
  CritDmgIcon,
  CritRateIcon,
  DefIcon,
  EffIcon,
  EffResIcon,
  EnerRegenIcon,
  FireIcon,
  HealBoostIcon,
  HpIcon,
  IceIcon,
  ImaginaryIcon,
  LightningIcon,
  PhysicalIcon,
  QuantumIcon,
  SpdIcon,
  WindIcon,
} from '../'

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
    case 'base_hp':
      return <HpIcon {...iconProps} />
    case 'atk':
    case 'atk_':
    case 'base_atk':
      return <AtkIcon {...iconProps} />
    case 'def':
    case 'def_':
    case 'base_def':
      return <DefIcon {...iconProps} />
    case 'spd':
      return <SpdIcon {...iconProps} />
    case 'crit_':
      return <CritRateIcon {...iconProps} />
    case 'crit_dmg_':
      return <CritDmgIcon {...iconProps} />
    case 'enerRegen_':
      return <EnerRegenIcon {...iconProps} />
    case 'heal_':
      return <HealBoostIcon {...iconProps} />
    case 'eff_':
      return <EffIcon {...iconProps} />
    case 'eff_res_':
      return <EffResIcon {...iconProps} />
    case 'brEff_':
      return <BrEffIcon {...iconProps} />
  }

  // TODO: Deprecated when ElementalTypeKey gets uncapitalized
  // match first character of elem string, replace it with uppercase version
  const ele = statKey
    .split('_')[0]
    .replace(/^./g, (match) => match.toUpperCase())
  if (allElementalTypeKeys.includes(ele as ElementalTypeKey))
    return <ElementIcon ele={ele as ElementalTypeKey} iconProps={iconProps} />

  return null
}

export function ElementIcon({
  ele,
  iconProps = {},
}: {
  ele: ElementalTypeKey
  iconProps?: SvgIconProps
}) {
  switch (ele) {
    case 'Fire':
      return <FireIcon {...iconProps} />
    case 'Ice':
      return <IceIcon {...iconProps} />
    case 'Imaginary':
      return <ImaginaryIcon {...iconProps} />
    case 'Lightning':
      return <LightningIcon {...iconProps} />
    case 'Quantum':
      return <QuantumIcon {...iconProps} />
    case 'Wind':
      return <WindIcon {...iconProps} />
    case 'Physical':
      return <PhysicalIcon {...iconProps} />
  }
}
