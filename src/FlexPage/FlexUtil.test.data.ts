import { IFlexArtifact } from "../Types/artifact"
import { IFlexCharacter } from "../Types/character"
import { IFlexWeapon } from "../Types/weapon"

export const oldURL = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=565k01043N09F18W04R165k03141Y79W0aa37G0p5g07242o21074W05l095k0j347E03z02c292195k09443j08111HbaV3a122003L9005551echaracterLevel289bStaffOfHoma3L900101000"

export const character: IFlexCharacter = {
  characterKey: 'HuTao',
  hitMode: 'avgHit',
  reactionMode: 'pyro_vaporize',
  constellation: 2,
  level: 89,
  ascension: 6,
  infusionAura: 'pyro',
  talentLevelKeys: { auto: 5, skill: 5, burst: 5 },
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
    useLockedArts: false,
  },
};

export const weapon: IFlexWeapon = {
  location: "HuTao",
  key: 'StaffOfHoma',
  level: 90,
  ascension: 6,
  refineIndex: 0,
}
export const artifacts: IFlexArtifact[] = [{
  setKey: 'GladiatorsFinale',
  numStars: 5,
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
}, {
  setKey: 'CrimsonWitchOfFlames',
  numStars: 5,
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
}, {
  setKey: 'CrimsonWitchOfFlames',
  numStars: 5,
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
}, {
  setKey: 'GladiatorsFinale',
  numStars: 5,
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
}, {
  setKey: 'ThunderingFury',
  numStars: 5,
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
},
]
