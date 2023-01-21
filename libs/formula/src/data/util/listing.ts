const characters = ['Nahida', 'Nilou'] as const // TODO
const weapons = ['KeyOfKhajNisut', 'TulaytullahsRemembrance'] as const // TODO
const arts = [] as const // TODO

const stats = ['hp', 'hp_', 'atk', 'atk_', 'def', 'def_', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_', 'dmg_', 'heal_'] as const
export const fixedQueries = {
  base: stats, premod: stats, final: stats,
  char: ['lvl', 'auto', 'skill', 'ele', 'burst', 'constellation', 'ascension', 'stamina', 'res'],
  weapon: ['lvl', 'refinement', 'ascension'],
  team: ['count', 'eleCount'],
  common: ['isActive', 'weaponType', 'critMode', 'special', 'cappedCritRate_', 'dmg', 'infusion'],
  enemy: ['lvl', 'defRed_', 'defIgn_', 'res'],
  dmg: ['final', 'inDmg', 'outDmg', 'dmgEle', 'critMulti'],
} as const
export const queryTypes = ['base', 'premod', 'final', 'char', 'weapon', 'team', 'common', 'enemy', 'dmg', 'misc'] as const
export const summableQueries = new Set([...stats, 'stamina', 'auto', 'skill', 'burst', 'constellation', 'ascension', 'refinement', 'defRed_', 'defIgn', 'res', 'count', 'eleCount'])

export const presets = ['preset0', 'preset1', 'preset2', 'preset3', 'preset4', 'preset5', 'preset6', 'preset7', 'preset8', 'preset9'] as const
export const entryTypes = ['self', 'teamBuff', 'active', 'enemy', 'target'] as const
export const srcs = [...characters, ...weapons, ...arts, 'char', 'weapon', 'art', 'enemy', 'custom', 'agg', 'team'] as const
export const dsts = presets

export const elements = ['pyro', 'hydro', 'geo', 'cryo', 'electro', 'dendro', 'physical'] as const
export const moves = ['normal', 'charged', 'plunging', 'skill', 'burst', 'elemental'] as const
export const regions = ["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya", "khaenriah"] as const

export const transformativeReactions = ['overloaded', 'shattered', 'electrocharged', 'superconduct', 'swirl', 'burning', 'bloom', 'burgeon', 'hyperbloom'] as const
export const amplifyingReactions = ['vaporize', 'melt'] as const
export const catalyzeReactions = ['spread', 'aggravate'] as const

export type Character = typeof characters[number]
export type Weapon = typeof weapons[number]
export type Artifact = typeof arts[number]

export type Stat = typeof stats[number]
export type CharacterStat = typeof fixedQueries['char'][number]
export type WeaponStat = typeof fixedQueries['weapon'][number]
export type TeamStat = typeof fixedQueries['team'][number]
export type EnemyStat = typeof fixedQueries['enemy'][number]
export type CommonQuery = typeof fixedQueries['common'][number]
export type DmgQuery = typeof fixedQueries['dmg'][number]

export type Preset = typeof presets[number]
export type EntryType = typeof entryTypes[number]
export type Source = typeof srcs[number]
export type Destination = typeof dsts[number]
export type QueryType = keyof typeof fixedQueries | 'misc'

export type Element = typeof elements[number]
export type Move = typeof moves[number]
export type Reaction = typeof transformativeReactions[number] | typeof amplifyingReactions[number] | typeof catalyzeReactions[number]
export type Region = typeof regions[number]
