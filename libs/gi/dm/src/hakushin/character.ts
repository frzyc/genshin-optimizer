import type { CharacterGrowCurveKey } from '../dm'
import type {
  AvatarAssocType,
  DQualityKey,
  DWeaponTypeKey,
  PropTypeKey,
} from '../mapping'

export type HakushinChar = {
  Name: string // "Varesa",
  Desc: string // "A laid-back orchard manager and warrior of the Collective of Plenty. An aspiring hero who hungers for justice... and lots and lots of food!",
  CharaInfo: {
    ReleaseDate: string // "2025-03-25 00:00:00",
    Birth: [number, number] // [11, 15],
    Vision: string // "Electro",
    Constellation: string // "Mascara Luctatori",
    Region: AvatarAssocType // "ASSOC_TYPE_NATLAN",
    Title: string // "Strength in Serenity",
    Native: string // "Teteocan",
    Detail: string // "A laid-back orchard manager and warrior of the Collective of Plenty. An aspiring hero who hungers for justice... and lots and lots of food!",
    VA: {
      Chinese: string // "乔苏",
      Japanese: string // "M・A・O",
      English: string // "Jane Jackson",
      Korean: string // "Kim Yea-lim"
    }
    Stories: {
      Title: string // "Character Details",
      Text: string // "\"Time for training, Varesa!\"\\nEvery",
      Unlock: string[]
    }[]
    Quotes: {
      Title: string // "Hello",
      Text: string // "Um... Hi! I'm Varesa from",
      Unlocked: string[]
    }[]
    SpecialFood: {
      Id: number // 108810,
      Recipe: number // 2508,
      Name: string // "Mt. Mushroom (For One)",
      Icon: string // "UI_ItemIcon_108800",
      Rank: number // 2
    }
    Namecard: {
      Id: number // 210236,
      Name: string // "Varesa: Powerhouse",
      Desc: string // "Namecard style.\\nWhat could possibly be the secret to her immense strength? D'you think it's got something to do with her nigh-on insatiable appetite...?",
      Icon: string // "UI_NameCardPic_Varesa_P"
    }
    Costume: {
      Id: number // 211100,
      Name: string // "Sugar Rush",
      Desc: string // "Varesa's outfit. In ",
      Icon: string // "",
      Quality: null
    }[]
    TraceEffect: [] // todo
  }
  Weapon: DWeaponTypeKey // "WEAPON_CATALYST",
  Rarity: DQualityKey // "QUALITY_ORANGE",
  Icon: string // "UI_AvatarIcon_Varesa",
  StaminaRecovery: number // 25,
  BaseHP: number // 988.59283,
  BaseATK: number // 27.7438,
  BaseDEF: number // 60.84711,
  CritRate: number // 0.05,
  CritDMG: number // 0.5,
  LevelEXP: number[] // [1000, 1325,],
  StatsModifier: {
    HP: Record<string, number>
    ATK: Record<string, number>
    DEF: Record<string, number> // {"1": 1, "2": 1.083,}
    Ascension: Partial<Record<PropTypeKey, number>>[]
    // [
    //     {
    //         "FIGHT_PROP_BASE_HP": 847.62897,
    //         "FIGHT_PROP_BASE_DEFENSE": 52.1721,
    //         "FIGHT_PROP_BASE_ATTACK": 23.786062,
    //         "FIGHT_PROP_CRITICAL": 0.0
    //     },
    // ]
    PropGrowCurves: {
      type:
        | 'FIGHT_PROP_BASE_HP'
        | 'FIGHT_PROP_BASE_ATTACK'
        | 'FIGHT_PROP_BASE_DEFENSE'
      // "FIGHT_PROP_BASE_HP",
      growCurve: CharacterGrowCurveKey // "GROW_CURVE_HP_S5"
    }[]
    RecommendedProps: [] // todo
  }
  Skills: {
    Name: string // "Normal Attack: By the Horns",
    Desc: string // "<color=#FFD780FF>Normal Attack</color>\\nGotta try... to do ",
    Promote: Record<
      string,
      {
        Level: number // 1,
        Icon: string // "Skill_A_Catalyst_MD",
        Desc: string[] // ["1-Hit DMG|{param1:F1P}","2-Hit DMG|{param2:F1P}",]
        Param: number[] // [0.467784, 0.40028,]
      }
    >
  }[]
  Passives: {
    Name: string // "Tag-Team Triple Jump!",
    Desc: string // "After using the Elemental Skill ",
    Icon: string // "UI_Talent_S_Varesa_05",
    Unlock: number // 1,
    ParamList: number[] // [0.5, 1.8]
  }[]
  Constellations: {
    Name: string // "Undying Passion",
    Desc: string // "The effects of the ",
    Icon: string // "UI_Talent_S_Varesa_01",
    ParamList: number[] // [1.8, 0.3]
  }[]
  Materials: unknown // todo
}
