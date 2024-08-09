import { cmpEq, cmpNE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey, StatKey } from '@genshin-optimizer/sr/consts'
import {
  allBonusAbilityKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr/consts'
import type { ICharacter, ILightCone } from '@genshin-optimizer/sr/srod'
import type { Member, Preset, Sheet, TagMapNodeEntries } from './data/util'
import {
  conditionalEntries,
  convert,
  getStatFromStatKey,
  reader,
  self,
  selfTag,
} from './data/util'

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
  const { self, teamBuff, notSelfBuff } = reader.sheet('agg').withAll('et', [])
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
    // Not Self Buff
    members.flatMap((dst) => {
      const entry = self.with('src', dst)
      return members
        .map((src) => entry.reread(notSelfBuff.withTag({ dst, src })))
        .filter(({ value }) => value.tag!['dst'] != value.tag!['src'])
    }),
    // Non-stacking
    members.slice(0, 4).flatMap((_, i) => {
      const { stackIn, stackTmp } = reader.withAll('qt', [])
      const src = `${i}` as '0' | '1' | '2' | '3'
      // Make sure not to use `sheet:agg` here to match `stackOut` on the `reader.addOnce` side
      const self = reader.withTag({ src, et: 'self' })
      // Use `i + 1` for priority so that `0` means no buff
      return [
        self.with('qt', 'stackTmp').add(cmpNE(stackIn, 0, i + 1)),
        self
          .with('qt', 'stackOut')
          .add(cmpEq(stackTmp.max.with('et', 'team'), i + 1, stackIn)),
      ]
    }),
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

/**
 * Generate conditional TagMapNodeEntry for calculator. Should be provided outside of any member data, in order to preserve specified 'src'
 * @param dst member to apply conditionals to
 * @param data conditional data in `Src: { Sheet: { CondKey: value } }` format. Src can be 'all', unless the buff is possibly duplicated (e.g. relic team buff). In that case, you should specify the src member
 * @returns
 */
export function conditionalData(
  dst: Member,
  data: Partial<
    Record<Member, Partial<Record<Sheet, Record<string, string | number>>>>
  >
) {
  return Object.entries(data).flatMap(([src, entries]) =>
    Object.entries(entries).flatMap(([key, entries]) => {
      const conds = conditionalEntries(key as Sheet, src as Member, dst)
      return Object.entries(entries).map(([k, v]) => conds(k, v))
    })
  )
}
