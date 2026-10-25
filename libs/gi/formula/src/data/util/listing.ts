import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'

const stats = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'eleMas',
  'enerRech_',
  'critRate_',
  'critDMG_',
  'dmg_',
  'heal_',
  'incHeal_',
  'atkSPD_',
  'moveSPD_',
  'weakspotDMG_',
  'res_',
  'staminaChargedDec_',
] as const

/** WR `nonStackBuff` group ids — used as `addOnce` channel sheets. */
const nonstackSheets = [
  'millenialatk',
  'leafCon',
  'leafRev',
  'wolf',
  'ttds',
  'angelos',
  'starcaller',
  'crane',
  'patrol',
  'nightweaver',
  'ap4',
  'totm4',
  'gleamingmoonintent',
  'heartofthefurnace',
  'hakushinpyro',
  'hakushinhydro',
  'hakushinelectro',
  'hakushincryo',
  'hakushinanemo',
  'hakushingeo',
  'hakushindendro',
  'key',
  'gleamingmoondevotion',
] as const

export const sheets = [
  'agg',
  'iso',
  'static',
  ...allCharacterKeys,
  ...allWeaponKeys,
  ...allArtifactSetKeys,
  'art',
  'reso',
  'dyn',
  'enemy',
  'custom',
  'Traveler',
  ...nonstackSheets,
] as const
export const members = ['0', '1', '2', '3'] as const

export type Stat = (typeof stats)[number]
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
export type Src = Member | null
export type Dst = Member | null
