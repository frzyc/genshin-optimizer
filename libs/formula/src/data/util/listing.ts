const characters = ['Candace', 'Nahida', 'Nilou'] as const // TODO
const weapons = ['CalamityQueller', 'KeyOfKhajNisut', 'TulaytullahsRemembrance'] as const // TODO
const arts = ['NoblesseOblige'] as const // TODO

const stats = ['hp', 'hp_', 'atk', 'atk_', 'def', 'def_', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_', 'dmg_', 'heal_'] as const

export const presets = ['preset0', 'preset1', 'preset2', 'preset3', 'preset4', 'preset5', 'preset6', 'preset7', 'preset8', 'preset9'] as const
export const entryTypes = ['self', 'teamBuff', 'active', 'enemy', 'team', 'target'] as const
export const srcs = ['prep', 'agg', 'iso', 'static', ...characters, ...weapons, ...arts, 'art', 'enemy', 'custom'] as const
export const preps = ['dmg', 'shield', 'heal', 'trans']
export const members = ['member0', 'member1', 'member2', 'member3'] as const
export const dsts = presets

export const elements = ['pyro', 'hydro', 'geo', 'cryo', 'electro', 'dendro', 'physical'] as const
export const moves = ['normal', 'charged', 'plunging', 'skill', 'burst', 'elemental'] as const
export const regions = ['mondstadt', 'liyue', 'inazuma', 'sumeru', 'fontaine', 'natlan', 'snezhnaya', 'khaenriah'] as const

export const transformativeReactions = ['overloaded', 'shattered', 'electrocharged', 'superconduct', 'swirl', 'burning', 'bloom', 'burgeon', 'hyperbloom', ''] as const
export const amplifyingReactions = ['vaporize', 'melt', ''] as const
export const catalyzeReactions = ['spread', 'aggravate', ''] as const

export type Character = typeof characters[number]
export type Weapon = typeof weapons[number]
export type WeaponType = 'sword' | 'bow' | 'polearm' | 'claymore' | 'catalyst'
export type Artifact = typeof arts[number]

export type Stat = typeof stats[number]
export type Preset = typeof presets[number]
export type EntryType = typeof entryTypes[number]
export type Source = typeof srcs[number]
export type Member = typeof members[number]
export type Destination = typeof dsts[number]

export type Element = typeof elements[number]
export type Move = typeof moves[number]
export type TransReaction = typeof transformativeReactions[number]
export type Reaction = TransReaction | typeof amplifyingReactions[number] | typeof catalyzeReactions[number]
export type Region = typeof regions[number]
