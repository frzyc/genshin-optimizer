import type { ElementWithPhyKey } from '@genshin-optimizer/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/consts'
import type { SvgIconProps } from '@mui/material'
import AnemoIcon from '../SVGIcons/Element/AnemoIcon'
import CryoIcon from '../SVGIcons/Element/CryoIcon'
import DendroIcon from '../SVGIcons/Element/DendroIcon'
import ElectroIcon from '../SVGIcons/Element/ElectroIcon'
import GeoIcon from '../SVGIcons/Element/GeoIcon'
import HydroIcon from '../SVGIcons/Element/HydroIcon'
import PhysicalIcon from '../SVGIcons/Element/PhysicalIcon'
import PyroIcon from '../SVGIcons/Element/PyroIcon'
import AtkIcon from '../SVGIcons/Stats/AtkIcon'
import CdRedIcon from '../SVGIcons/Stats/CdRedIcon'
import CritDmgIcon from '../SVGIcons/Stats/CritDmgIcon'
import CritRateIcon from '../SVGIcons/Stats/CritRateIcon'
import DefIcon from '../SVGIcons/Stats/DefIcon'
import EleMasIcon from '../SVGIcons/Stats/EleMasIcon'
import EnerRechIcon from '../SVGIcons/Stats/EnerRechIcon'
import HealAddIcon from '../SVGIcons/Stats/HealAddIcon'
import HealingBonusIcon from '../SVGIcons/Stats/HealingBonusIcon'
import HpIcon from '../SVGIcons/Stats/HpIcon'
import ShieldStrIcon from '../SVGIcons/Stats/ShieldStrIcon'
import StaminaIcon from '../SVGIcons/Stats/StaminaIcon'

export default function StatIcon({
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
    case 'eleMas':
      return <EleMasIcon {...iconProps} />
    case 'critRate_':
      return <CritRateIcon {...iconProps} />
    case 'critDMG_':
      return <CritDmgIcon {...iconProps} />
    case 'enerRech_':
      return <EnerRechIcon {...iconProps} />
    case 'incHeal_':
      return <HealAddIcon {...iconProps} />
    case 'heal_':
      return <HealingBonusIcon {...iconProps} />
    case 'cdRed_':
      return <CdRedIcon {...iconProps} />
    case 'shield_':
      return <ShieldStrIcon {...iconProps} />
    case 'stamina':
      return <StaminaIcon {...iconProps} />
  }
  const ele = statKey.split('_')[0]
  if (allElementWithPhyKeys.includes(ele as ElementWithPhyKey))
    return <ElementIcon ele={ele as ElementWithPhyKey} iconProps={iconProps} />

  return null
}

export function ElementIcon({
  ele,
  iconProps = {},
}: {
  ele: ElementWithPhyKey
  iconProps?: SvgIconProps
}) {
  switch (ele) {
    case 'anemo':
      return <AnemoIcon {...iconProps} />
    case 'cryo':
      return <CryoIcon {...iconProps} />
    case 'dendro':
      return <DendroIcon {...iconProps} />
    case 'electro':
      return <ElectroIcon {...iconProps} />
    case 'geo':
      return <GeoIcon {...iconProps} />
    case 'hydro':
      return <HydroIcon {...iconProps} />
    case 'physical':
      return <PhysicalIcon {...iconProps} />
    case 'pyro':
      return <PyroIcon {...iconProps} />
  }
}
