import type { ElementalDamageKey } from '@genshin-optimizer/sr/consts'
import { allElementalDamageKeys } from '@genshin-optimizer/sr/consts'
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
  const ele = statKey.split('_')[0]
  if (allElementalDamageKeys.includes(ele as ElementalDamageKey))
    return <ElementIcon ele={ele as ElementalDamageKey} iconProps={iconProps} />

  return null
}

export function ElementIcon({
  ele,
  iconProps = {},
}: {
  ele: ElementalDamageKey
  iconProps?: SvgIconProps
}) {
  switch (ele) {
    case 'fire':
      return <FireIcon {...iconProps} />
    case 'ice':
      return <IceIcon {...iconProps} />
    case 'imaginary':
      return <ImaginaryIcon {...iconProps} />
    case 'lightning':
      return <LightningIcon {...iconProps} />
    case 'quantum':
      return <QuantumIcon {...iconProps} />
    case 'wind':
      return <WindIcon {...iconProps} />
    case 'physical':
      return <PhysicalIcon {...iconProps} />
  }
}
