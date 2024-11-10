import { cmpEq, cmpNE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey, StatKey } from '@genshin-optimizer/sr/consts'
import {
  allBonusAbilityKeys,
  allStatBoostKeys,
} from '@genshin-optimizer/sr/consts'
import type { ICharacter, ILightCone } from '@genshin-optimizer/sr/srod'
import type { Member, Preset, TagMapNodeEntries } from './data/util'
import {
  convert,
  getStatFromStatKey,
  own,
  ownBuff,
  ownTag,
  reader,
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
  const { lvl, basic, skill, ult, talent, ascension, eidolon } = own.char
  const { char, iso, [data.key]: sheet } = reader.withAll('sheet', [])

  return [
    char.reread(sheet),
    iso.reread(sheet),

    lvl.add(data.level),
    basic.add(data.basic),
    skill.add(data.skill),
    ult.add(data.ult),
    talent.add(data.talent),
    ascension.add(data.ascension),
    eidolon.add(data.eidolon),
    ...allStatBoostKeys.map((index) =>
      ownBuff.char[`statBoost${index}`].add(data.statBoosts[index] ? 1 : 0)
    ),
    ...allBonusAbilityKeys.map((index) =>
      ownBuff.char[`bonusAbility${index}`].add(
        data.bonusAbilities[index] ? 1 : 0
      )
    ),

    // Default char
    ownBuff.premod.crit_.add(0.05),
    ownBuff.premod.crit_dmg_.add(0.5),
  ]
}

export function lightConeData(data: ILightCone | undefined): TagMapNodeEntries {
  if (!data) return []
  const { lvl, ascension, superimpose } = own.lightCone

  return [
    // Mark light cones as used
    own.common.count.sheet(data.key).add(1),

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
  } = convert(ownTag, { sheet: 'relic', et: 'own' })
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
  const { own, enemy, teamBuff, notOwnBuff } = reader
    .sheet('agg')
    .withAll('et', [])
  return [
    // Target Entries
    members.map((dst) =>
      reader
        .withTag({ et: 'target', dst })
        .reread(reader.withTag({ et: 'own', dst: null, src: dst }))
    ),
    // Team Buff
    members.flatMap((dst) => {
      const entry = own.with('src', dst)
      return members.map((src) =>
        entry.reread(teamBuff.withTag({ dst, src, name: null }))
      )
    }),
    // Not Self Buff
    members.flatMap((dst) => {
      const entry = own.with('src', dst)
      return members
        .filter((src) => src !== dst)
        .map((src) =>
          entry.reread(notOwnBuff.withTag({ dst, src, name: null }))
        )
    }),
    // Enemy Debuff
    members.map((src) =>
      enemy.reread(
        reader.withTag({ et: 'enemyDeBuff', dst: null, src, name: null })
      )
    ),
    // Non-stacking
    members.flatMap((src, i) => {
      const { stackIn, stackTmp } = reader.withAll('qt', [])
      // Make sure not to use `sheet:agg` here to match `stackOut` on the `reader.addOnce` side
      const own = reader.withTag({ src, et: 'own' })
      // Use `i + 1` for priority so that `0` means no buff
      return [
        own.with('qt', 'stackTmp').add(cmpNE(stackIn, 0, i + 1)),
        own
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
    members.map((src) => teamEntry.add(reader.withTag({ src, et: 'own' }).sum)),
  ].flat()
}
