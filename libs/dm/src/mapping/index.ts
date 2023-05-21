export * from './character'
export * from './weapon'
export * from './artifact'

export const tagColor = {
  FFD780FF: 'strong',
  '80FFD7FF': 'anemo',
  FFE699FF: 'geo',
  '99FFFFFF': 'cryo',
  '80C0FFFF': 'hydro',
  FF9999FF: 'pyro',
  FFACFFFF: 'electro',
  '99FF88FF': 'dendro',
} as const
export type ColorTag = (typeof tagColor)[keyof typeof tagColor]

export const weaponMap = {
  WEAPON_SWORD_ONE_HAND: 'sword',
  WEAPON_CATALYST: 'catalyst',
  WEAPON_CLAYMORE: 'claymore',
  WEAPON_BOW: 'bow',
  WEAPON_POLE: 'polearm',
} as const
export type DWeaponTypeKey = keyof typeof weaponMap
export type WeaponTypeKey = (typeof weaponMap)[keyof typeof weaponMap]

export const SubStatPropTypeMap = {
  FIGHT_PROP_HP: 'hp',
  FIGHT_PROP_HP_PERCENT: 'hp_',
  FIGHT_PROP_ATTACK: 'atk',
  FIGHT_PROP_ATTACK_PERCENT: 'atk_',
  FIGHT_PROP_DEFENSE: 'def',
  FIGHT_PROP_DEFENSE_PERCENT: 'def_',
  FIGHT_PROP_CRITICAL: 'critRate_',
  FIGHT_PROP_CRITICAL_HURT: 'critDMG_',
  FIGHT_PROP_ELEMENT_MASTERY: 'eleMas',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'enerRech_',
} as const
export type DSubstatKey = keyof typeof SubStatPropTypeMap
export type SubstatKey =
  (typeof SubStatPropTypeMap)[keyof typeof SubStatPropTypeMap]

const { FIGHT_PROP_DEFENSE, ...mainPart } = SubStatPropTypeMap //subtract flat def
export const MainPropMap = {
  ...mainPart,
  FIGHT_PROP_HEAL_ADD: 'heal_',
  FIGHT_PROP_PHYSICAL_ADD_HURT: 'physical_dmg_',
  FIGHT_PROP_ELEC_ADD_HURT: 'electro_dmg_',
  FIGHT_PROP_ROCK_ADD_HURT: 'geo_dmg_',
  FIGHT_PROP_FIRE_ADD_HURT: 'pyro_dmg_',
  FIGHT_PROP_WATER_ADD_HURT: 'hydro_dmg_',
  FIGHT_PROP_ICE_ADD_HURT: 'cryo_dmg_',
  FIGHT_PROP_WIND_ADD_HURT: 'anemo_dmg_',
  FIGHT_PROP_GRASS_ADD_HURT: 'dendro_dmg_',
  // FIGHT_PROP_FIRE_SUB_HURT:"" //
} as const
export type MainStatKey = (typeof MainPropMap)[keyof typeof MainPropMap]

export const propTypeMap = {
  ...SubStatPropTypeMap,
  ...MainPropMap,
  FIGHT_PROP_ADD_HURT: 'dmg_',
  FIGHT_PROP_BASE_HP: 'hp',
  FIGHT_PROP_BASE_ATTACK: 'atk',
  FIGHT_PROP_BASE_DEFENSE: 'def',
} as const
export type PropTypeKey = keyof typeof propTypeMap
export type StatKey = (typeof propTypeMap)[keyof typeof propTypeMap]

export const QualityTypeMap = {
  QUALITY_ORANGE: 5,
  QUALITY_PURPLE: 4,
  QUALITY_BLUE: 3,
  QUALITY_GREEN: 2,
} as const
export type DQualityKey = keyof typeof QualityTypeMap
