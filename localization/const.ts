export const tagColor = {
  "FFD780FF": "strong",
  "80FFD7FF": "anemo",
  "FFE699FF": "geo",
  "99FFFFFF": "cryo",
  "80C0FFFF": "hydro",
  "FF9999FF": "pyro",
  "FFACFFFF": "electro"
} as const
export const langKeys = ["chs", "cht", "de", "en", "es", "fr", "id", "ja", "ko", "pt", "ru", "th", "vi"] as const
export type ColorTag = typeof tagColor[keyof typeof tagColor]
export type Language = typeof langKeys[number]


export const characterIdMap = {
  //10000000: Kate
  //10000001: Ayaka
  10000003: "jean",
  10000005: "traveler_geo",
  10000006: "lisa",
  10000007: "traveler_anemo",
  10000014: "barbara",
  10000015: "kaeya",
  10000016: "diluc",
  10000020: "razor",
  10000021: "amber",
  10000022: "venti",
  10000023: "xiangling",
  10000024: "beidou",
  10000025: "xingqiu",
  10000026: "xiao",
  10000027: "ningguang",
  10000029: "klee",
  10000030: "zhongli",
  10000031: "fischl",
  10000032: "bennett",
  10000033: "tartaglia",
  10000034: "noelle",
  10000035: "qiqi",
  10000036: "chongyun",
  10000037: "ganyu",
  10000038: "albedo",
  10000039: "diona",
  10000041: "mona",
  10000042: "keqing",
  10000043: "sucrose",
  10000044: "xinyan",
  10000045: "rosaria",
  10000046: "hutao",
  10000047: "kaedeharakazuha",
  10000048: "yanfei",
  // 10000049: "TEMPLATE",
  // 10000050: "TEMPLATE",
  10000051: "eula",
  // 10000053: "TEMPLATE",
  // 11000008: "TEMPLATE",
  // 11000009: "TEMPLATE",
  // 11000010: "TEMPLATE",
  // 11000011: "TEMPLATE",
} as const

export const weaponMap = {
  WEAPON_SWORD_ONE_HAND: "sword",
  WEAPON_CATALYST: "catalyst",
  WEAPON_CLAYMORE: "claymore",
  WEAPON_BOW: "bow",
  WEAPON_POLE: "polearm"
} as const
export const propTypeMap = {
  FIGHT_PROP_BASE_HP: "hp",
  FIGHT_PROP_BASE_ATTACK: "atk",
  FIGHT_PROP_BASE_DEFENSE: "def",
  FIGHT_PROP_HEAL_ADD: "heal_",
  FIGHT_PROP_CRITICAL_HURT: "critDMG_",
  FIGHT_PROP_ELEMENT_MASTERY: "eleMas",
  FIGHT_PROP_ATTACK_PERCENT: "atk_",
  FIGHT_PROP_HP_PERCENT: "hp_",
  FIGHT_PROP_CHARGE_EFFICIENCY: "enerRech_",
  FIGHT_PROP_CRITICAL: "critRate_",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "physical_dmg_",
  FIGHT_PROP_ELEC_ADD_HURT: "electro_dmg_",
  FIGHT_PROP_ROCK_ADD_HURT: "geo_dmg_",
  FIGHT_PROP_FIRE_ADD_HURT: "pyro_dmg_",
  FIGHT_PROP_WATER_ADD_HURT: "hydro_dmg_",
  FIGHT_PROP_DEFENSE_PERCENT: "def_",
  FIGHT_PROP_ICE_ADD_HURT: "cryo_dmg_",
  FIGHT_PROP_WIND_ADD_HURT: "anemo_dmg_",
} as const
export const QualityTypeMap = {
  QUALITY_ORANGE: 5,
  QUALITY_PURPLE: 4,
  QUALITY_BLUE: 3,
  QUALITY_GREEN: 2,
} as const