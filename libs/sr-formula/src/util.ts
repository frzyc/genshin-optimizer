import { cmpEq, cmpGE } from '@genshin-optimizer/pando'
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

export function lightConeData(data: ILightCone | undefined): TagMapNodeEntries {
  if (!data) return []
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

export function teamData(members: readonly Member[]): TagMapNodeEntries {
  const teamEntry = reader.with('et', 'team')
  const { self, teamBuff } = reader.src('agg').withAll('et', [])
  const { stackIn, stackInt, stackOut } = reader.withAll('qt', [])
  return [
    // Team Buff
    members.flatMap((dst) => {
      const entry = self.with('member', dst)
      return members.map((src) =>
        entry.reread(teamBuff.withTag({ dst, member: src }))
      )
    }),
    // Stacking
    members.map((member, i) =>
      stackInt.add(cmpGE(stackIn.withTag({ member }).max, 1, i + 1))
    ),
    members.map((member, i) =>
      stackOut.withTag({ member }).add(cmpEq(stackInt.max, i + 1, 1))
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
    members.map((member) =>
      teamEntry.add(reader.withTag({ member, et: 'self' }).sum)
    ),
  ].flat()
}
