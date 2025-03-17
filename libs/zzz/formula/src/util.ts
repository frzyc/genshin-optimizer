import type { Preset } from '@genshin-optimizer/game-opt/engine'
import { cmpEq, cmpNE } from '@genshin-optimizer/pando/engine'
import type {
  CharacterKey,
  DiscMainStatKey,
  DiscSetKey,
  DiscSubStatKey,
  MilestoneKey,
  PhaseKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { Member, TagMapNodeEntries } from './data/util'
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

type TempICharacter = {
  key: CharacterKey
  level: number
  promotion: number
  basic: number
  dodge: number
  special: number
  chain: number
  assist: number
  core: number
  mindscape: number
}
export function charTagMapNodeEntries(data: TempICharacter): TagMapNodeEntries {
  const {
    lvl,
    promotion,
    basic,
    dodge,
    special,
    chain,
    assist,
    core,
    mindscape,
  } = own.char
  const { char, iso, [data.key]: sheet } = reader.withAll('sheet', [])

  return [
    char.reread(sheet),
    iso.reread(sheet),

    lvl.add(data.level),
    basic.add(data.basic),
    dodge.add(data.dodge),
    special.add(data.special),
    chain.add(data.chain),
    assist.add(data.assist),
    core.add(data.core),
    promotion.add(data.promotion),
    mindscape.add(data.mindscape),

    // Default char
    ownBuff.base.crit_.add(0.05),
    ownBuff.base.crit_dmg_.add(0.5),
  ]
}

export function wengineTagMapNodeEntries(
  key: WengineKey,
  level: number,
  modification: MilestoneKey,
  phase: PhaseKey
): TagMapNodeEntries {
  return [
    // Opt-in for wengine buffs, instead of enabling it by default to reduce `read` traffic
    reader
      .sheet('agg')
      .reread(reader.sheet('wengine')),
    // Mark wengine cones as used
    own.common.count
      .sheet(key)
      .add(1),
    own.wengine.lvl.add(level),
    own.wengine.modification.add(modification),
    own.wengine.phase.add(phase),
  ]
}

export function discTagMapNodeEntries(
  stats: Partial<Record<DiscMainStatKey | DiscSubStatKey, number>>,
  sets: Partial<Record<DiscSetKey, number>>
): TagMapNodeEntries {
  const {
    common: { count },
    initial,
  } = convert(ownTag, { sheet: 'disc', et: 'own' })
  return [
    // Opt-in for disc buffs, instead of enabling it by default to reduce `read` traffic
    reader
      .sheet('agg')
      .reread(reader.sheet('disc')),

    // Add `sheet:dyn` between the stat and the buff so that we can `detach` them easily
    // Used for disc main/sub stats, as those are fed into the builder at run-time, after nodes are optimized
    reader
      .withTag({ sheet: 'disc', qt: 'initial' })
      .reread(reader.sheet('dyn')),
    ...Object.entries(stats).map(([k, v]) =>
      getStatFromStatKey(initial, k).sheet('dyn').add(v)
    ),

    ...Object.entries(sets).map(([k, v]) =>
      count.sheet(k as DiscSetKey).add(v)
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
    members.map((src) => teamEntry.add(reader.withTag({ src, et: 'own' }))),
  ].flat()
}
