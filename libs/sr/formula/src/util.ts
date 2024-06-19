import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey, StatKey } from '@genshin-optimizer/sr/consts'
import {
  allBonusAbilityKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr/consts'
import type { ICharacter, ILightCone } from '@genshin-optimizer/sr/srod'
import type { Member, Preset, TagMapNodeEntries } from './data/util'
import { convert, getStatFromStatKey, reader, self, selfTag } from './data/util'

export function withPreset(
  preset: Preset,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, preset }, value }))
}
export function withMember(
  src: Member,
  ...data: TagMapNodeEntries
): TagMapNodeEntries {
  return data.map(({ tag, value }) => ({ tag: { ...tag, src }, value }))
}

export function charData(data: ICharacter): TagMapNodeEntries {
  const { lvl, basic, skill, ult, talent, ascension, eidolon } = self.char

  return [
    reader.sheet('char').reread(reader.sheet(data.key)),
    reader.withTag({ sheet: 'iso', et: 'self' }).reread(reader.sheet(data.key)),

    lvl.add(data.level),
    basic.add(data.basic),
    skill.add(data.skill),
    ult.add(data.ult),
    talent.add(data.talent),
    ascension.add(data.ascension),
    eidolon.add(data.eidolon),
    ...allStatBoostKeys.map((index) =>
      self.char[`statBoost${index}`].add(data.statBoosts[index] ? 1 : 0)
    ),
    ...allBonusAbilityKeys.map((index) =>
      self.char[`bonusAbility${index}`].add(data.bonusAbilities[index] ? 1 : 0)
    ),

    // Default char
    self.premod.crit_.add(0.05),
    self.premod.crit_dmg_.add(0.5),
  ]
}

export function lightConeData(data: ILightCone | undefined): TagMapNodeEntries {
  if (!data) return []
  const { lvl, ascension, superimpose } = self.lightCone

  return [
    reader.sheet('lightCone').reread(reader.sheet(data.key)),

    lvl.add(data.level),
    ascension.add(data.ascension),
    superimpose.add(data.superimpose),
  ]
}

export function relicsData(
  data: {
    set: RelicSetKey
    stats: readonly { key: StatKey; value: number }[]
  }[]
): TagMapNodeEntries {
  const {
    common: { count },
    premod,
  } = convert(selfTag, { sheet: 'relic', et: 'self' })
  const sets: Partial<Record<RelicSetKey, number>> = {},
    stats: Partial<Record<StatKey, number>> = {}
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
    reader.sheet('agg').reread(reader.sheet('relic')),

    // Add `sheet:dyn` between the stat and the buff so that we can `detach` them easily
    reader
      .withTag({ sheet: 'relic', qt: 'premod' })
      .reread(reader.sheet('dyn')),
    ...Object.entries(stats).map(([k, v]) =>
      getStatFromStatKey(premod, k).sheet('dyn').add(v)
    ),

    ...Object.entries(sets).map(([k, v]) =>
      count.sheet(k as RelicSetKey).add(v)
    ),
  ]
}

export function teamData(members: readonly Member[]): TagMapNodeEntries {
  const teamEntry = reader.with('et', 'team')
  const { self, teamBuff } = reader.sheet('agg').withAll('et', [])
  const { stackIn, stackInt, stackOut } = reader.withAll('qt', [])
  return [
    // Target Entries
    members.map((dst) =>
      reader
        .withTag({ et: 'target', dst })
        .reread(reader.withTag({ et: 'self', dst: null, src: dst }))
    ),
    // Self Buff
    members.map((src) =>
      self.with('src', src).reread(reader.withTag({ et: 'selfBuff', dst: src }))
    ),
    // Team Buff
    members.flatMap((dst) => {
      const entry = self.with('src', dst)
      return members.map((src) => entry.reread(teamBuff.withTag({ dst, src })))
    }),
    // Stacking
    members.map((src, i) =>
      stackInt.add(cmpGE(stackIn.withTag({ src }).max, 1, i + 1))
    ),
    members.map((src, i) =>
      stackOut.withTag({ src }).add(cmpEq(stackInt.max, i + 1, 1))
    ),
    // Total Team Stat
    //
    // CAUTION:
    // This formula only works for queries with default `undefined` or `sum` accumulator.
    // Using this on queries with other accumulators, e.g., `ampMulti` may results in an
    // incorrect result. We cannot use `reread` here because the outer `team` query may
    // use different accumulators from the inner query. Such is the case for maximum team
    // final eleMas, where the outer query uses a `max` accumulator, while final eleMas
    // must use `sum` accumulator for a correct result.
    members.map((src) =>
      teamEntry.add(reader.withTag({ src, et: 'self' }).sum)
    ),
  ].flat()
}
