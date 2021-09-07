import { IArtifact } from "../Types/artifact"
import { ICharacter } from "../Types/character"
import { IWeapon } from "../Types/weapon"

export const urlV2 = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=565k01043N09F18W04R165k03141Y79W0aa37G0p5g07242o21074W05l095k0j347E03z02c292195k09443j08111HbaV3a122003L9005551echaracterLevel289bStaffOfHoma3L900101000"
export const urlV3 = "https://frzyc.github.io/genshin-optimizer/#/flex?v=3&d=1a120066601O056k0143N09F18W04R1b56k0341Y79W0aa37G0bdpg0742o21074W05l0bl9k0j47E03z02c2921bt9k0943j08111HbaV3bB1bStaffOfHomabN0"

export const character: ICharacter = {
  key: 'HuTao',
  hitMode: 'avgHit',
  reactionMode: 'pyro_vaporize',
  constellation: 2,
  level: 89,
  ascension: 6,
  infusionAura: 'pyro',
  talent: { auto: 6, skill: 6, burst: 6 },
  baseStatOverrides: {},
  conditionalValues: {
    artifact: {},
    character: {
      HuTao: {
        SanguineRouge: [1],
        GuideToAfterlife: [1],
      }
    },
    weapon: {
      StaffOfHoma: {
        esj: [1],
      }
    }
  },
  buildSettings: {
    ascending: false,
    mainStatAssumptionLevel: 0,
    mainStatKeys: {
      circlet: [],
      goblet: [],
      sands: [],
    },
    optimizationTarget: "finalAtk",
    setFilters: [
      { key: "", num: 0, },
      { key: "", num: 0, },
      { key: "", num: 0, },
    ],
    statFilters: {},
    useEquippedArts: false,
    useExcludedArts: false,
  },
};

export const weapon: IWeapon = {
  location: "HuTao",
  key: 'StaffOfHoma',
  level: 90,
  ascension: 6,
  refine: 1,
}
export const artifacts: IArtifact[] = [{
  setKey: 'GladiatorsFinale',
  rarity: 5,
  level: 20,
  mainStatKey: 'pyro_dmg_',
  slotKey: 'goblet',
  substats: [
    { key: 'eleMas', value: 40 },
    { key: 'atk', value: 35 },
    { key: 'hp_', value: 14 },
    { key: 'critRate_', value: 6.6 }
  ],
  location: 'HuTao',
  lock: false,
  exclude: false,
}, {
  setKey: 'CrimsonWitchOfFlames',
  rarity: 5,
  level: 20,
  mainStatKey: 'hp',
  slotKey: 'flower',
  substats: [
    { key: 'atk', value: 49 },
    { key: 'critRate_', value: 10.5 },
    { key: 'enerRech_', value: 5.8 },
    { key: 'atk_', value: 11.7 }
  ],
  location: 'HuTao',
  lock: false,
  exclude: false,
}, {
  setKey: 'CrimsonWitchOfFlames',
  rarity: 5,
  level: 20,
  mainStatKey: 'atk',
  slotKey: 'plume',
  substats: [
    { key: 'hp', value: 508 },
    { key: 'critRate_', value: 5.8 },
    { key: 'critDMG_', value: 20.2 },
    { key: 'eleMas', value: 42 }
  ],
  location: 'HuTao',
  lock: false,
  exclude: false,
}, {
  setKey: 'GladiatorsFinale',
  rarity: 5,
  level: 20,
  mainStatKey: 'critRate_',
  slotKey: 'circlet',
  substats: [
    { key: 'atk', value: 19 },
    { key: 'enerRech_', value: 6.5 },
    { key: 'hp', value: 747 },
    { key: 'critDMG_', value: 24.9 }
  ],
  location: 'HuTao',
  lock: false,
  exclude: false,
}, {
  setKey: 'ThunderingFury',
  rarity: 5,
  level: 16,
  mainStatKey: 'eleMas',
  slotKey: 'sands',
  substats: [
    { key: 'hp_', value: 15.2 },
    { key: 'hp', value: 448 },
    { key: 'atk_', value: 5.8 },
    { key: 'def', value: 21 }
  ],
  location: 'HuTao',
  lock: false,
  exclude: false,
},
]
