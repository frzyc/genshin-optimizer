import type { RelicSetKey } from '@genshin-optimizer/sr-consts'
import {
  allBonusAbilityKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr-consts'
import type { ICharacter, ILightCone } from '@genshin-optimizer/sr-srod'
import type { Member, Preset, Stat, TagMapNodeEntries } from './data/util'
import { convert, reader, selfBuff, selfTag } from './data/util'

export function withPreset(
  preset: Preset,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, preset }, value }))
}
export function withMember(
  member: Member,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, member }, value }))
}

export function charData(data: ICharacter): TagMapNodeEntries {
  const { lvl, basic, skill, ult, talent, ascension, eidolon } = selfBuff.char

  return [
    reader.src('agg').reread(reader.src(data.key)),
    reader.withTag({ src: 'iso', et: 'self' }).reread(reader.src(data.key)),

    lvl.add(data.level),
    basic.add(data.basic),
    skill.add(data.skill),
    ult.add(data.ult),
    talent.add(data.talent),
    ascension.add(data.ascension),
    eidolon.add(data.eidolon),
    ...allStatBoostKeys.map((index) =>
      selfBuff.char[`statBoost${index}`].add(data.statBoosts[index] ? 1 : 0)
    ),
    ...allBonusAbilityKeys.map((index) =>
      selfBuff.char[`bonusAbility${index}`].add(
        data.bonusAbilities[index] ? 1 : 0
      )
    ),

    // Default char
    selfBuff.premod.crit_.add(0.05),
    selfBuff.premod.crit_dmg_.add(0.5),
  ]
}

export function lightConeData(data: ILightCone): TagMapNodeEntries {
  const { lvl, ascension, superimpose } = selfBuff.lightCone

  return [
    reader.src('agg').reread(reader.src(data.key)),

    lvl.add(data.level),
    ascension.add(data.ascension),
    superimpose.add(data.superimpose),
  ]
}

export function relicsData(
  data: {
    set: RelicSetKey
    stats: readonly { key: Stat; value: number }[]
  }[]
): TagMapNodeEntries {
  const {
    common: { count },
    premod,
  } = convert(selfTag, { src: 'relic', et: 'self' })
  const sets: Partial<Record<RelicSetKey, number>> = {},
    stats: Partial<Record<Stat, number>> = {}
  for (const { set: setKey, stats: stat } of data) {
    const set = sets[setKey]
    if (set === undefined) sets[setKey] = 1
    else sets[setKey] = set + 1
    for (const { key, value } of stat) {
      const stat = stats[key]
      if (stat === undefined) stats[key] = value
      else stats[key] = stat + value
    }
  }
  return [
    // Opt-in for artifact buffs, instead of enabling it by default to reduce `read` traffic
    reader.src('agg').reread(reader.src('relic')),

    // Add `src:dyn` between the stat and the buff so that we can `detach` them easily
    reader.withTag({ src: 'relic', qt: 'premod' }).reread(reader.src('dyn')),
    ...Object.entries(stats).map(([k, v]) =>
      premod[k as Stat].src('dyn').add(v)
    ),

    ...Object.entries(sets).map(([k, v]) => count.src(k as RelicSetKey).add(v)),
  ]
}
