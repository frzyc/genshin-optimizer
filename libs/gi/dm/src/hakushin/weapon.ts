import type { RarityKey } from '@genshin-optimizer/gi/consts'
import type { WeaponGrowCurveKey } from '../dm'
import type { DWeaponTypeKey, PropTypeKey } from '../mapping'

export type HakushinWeapon = {
  Name: string // "Vivid Notions",
  Desc: string // "A trophy made from gemstones from the Collective of Plenty and crystals from the Flower-Feather Clan. It is said to have once belonged to a legendary wrestler.",
  WeaponType: DWeaponTypeKey // "WEAPON_CATALYST",
  WeaponProp: {
    type: WeaponGrowCurveKey // "GROW_CURVE_ATTACK_302",
    propType: PropTypeKey // "FIGHT_PROP_BASE_ATTACK",
    initValue: number // 47.537
  }[]
  Rarity: RarityKey // 5,
  Icon: string // "UI_EquipIcon_Catalyst_VaresaTransformer",
  StatsModifier: {
    [stat in PropTypeKey | 'ATK']: {
      Base: number // 0.096,
      Levels: Record<string, number> // { "1": 1, "2": 1 }
    }
  }
  XPRequirements: Record<string, number> // { "1": 600, "2": 950 }
  Ascension: Record<string, { FIGHT_PROP_BASE_ATTACK: number }> // { "1": { "FIGHT_PROP_BASE_ATTACK": 31.1 }, }
  Refinement: Record<
    string,
    {
      Name: string
      Desc: string
      ParamList: number[]
    }
  >
  // "1": {
  //   "Name": "Falling Rainbow's Wish",
  //   "Desc": "ATK is increased by <color=#99FFFFFF>28%</color>. When you use a Plunging Attack, you will gain the \"Dawn's First Hue\" effect: Plunging Attack CRIT DMG is increased by <color=#99FFFFFF>28%</color>. When you use an Elemental Skill or Burst, you will gain the \"Twilight's Splendor\" effect: Plunging Attack CRIT DMG is increased by <color=#99FFFFFF>40%</color>. The two effects above each last for 15s, and will be canceled 0.1s after the ground impact hits a target.",
  //   "ParamList": [0.28, 15, 0.28, 0.4]
  // },
  Materials: unknown // TODO
}
