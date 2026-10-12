import type { Preset, SrcCondInfo } from '@genshin-optimizer/game-opt/engine'
import { stackListingNulls } from '@genshin-optimizer/game-opt/engine'
import {
  type ArtifactSetKey,
  allTravelerKeys,
  type MainStatKey,
  type SubstatKey,
  type TravelerKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { cmpEq, cmpNE } from '@genshin-optimizer/pando/engine'
import type { Member, Sheet, TagMapNodeEntries } from './data/util'
import {
  conditionalEntries,
  convert,
  own,
  ownBuff,
  ownTag,
  reader,
  readStat,
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

/** Solo teams always treat that member as on-field. */
export function resolveActiveMember(
  memberKeys: readonly Member[],
  requested?: string
): Member {
  if (memberKeys.length === 1) {
    const only = memberKeys[0]
    if (only) return only
  }
  if (requested && memberKeys.includes(requested as Member))
    return requested as Member
  return memberKeys[0] ?? '0'
}

export function dynIsActiveEntry(src: Member) {
  return conditionalEntries('dyn', src, null)('isActive', 1)
}

/** WR `conditional.Traveler.${tk.toLowerCase()}`. */
export function travelerEleCondName(key: TravelerKey): string {
  return key.toLowerCase()
}

export function travelerEleCondEntries(
  members: readonly Member[],
  unlocked: readonly TravelerKey[]
): TagMapNodeEntries {
  return members.flatMap((src) =>
    unlocked.map((tk) =>
      conditionalEntries('Traveler', src, null)(travelerEleCondName(tk), 1)
    )
  )
}

export function unlockedTravelerKeys(
  hasChar: (key: TravelerKey) => boolean
): TravelerKey[] {
  return allTravelerKeys.filter(hasChar)
}

export function travelerMemberSrcs(
  members: ReadonlyArray<{ src: Member; charKey?: string }>
): Member[] {
  return members
    .filter(
      (m) =>
        !!m.charKey &&
        (allTravelerKeys as readonly string[]).includes(m.charKey)
    )
    .map((m) => m.src)
}

/** Solo teams always mark the only member on-field. Traveler ele conds match WR. */
export function pandoContextEntries({
  memberKeys,
  activeMember,
  travelerSrcs = [],
  unlockedTravelers = [],
}: {
  memberKeys: readonly Member[]
  activeMember?: string
  travelerSrcs?: readonly Member[]
  unlockedTravelers?: readonly TravelerKey[]
}): TagMapNodeEntries {
  const injectActive = memberKeys.length === 1 || activeMember !== undefined
  return [
    ...(injectActive
      ? [dynIsActiveEntry(resolveActiveMember(memberKeys, activeMember))]
      : []),
    ...travelerEleCondEntries(travelerSrcs, unlockedTravelers),
  ]
}

export function charData(data: ICharacter): TagMapNodeEntries {
  const { lvl, auto, skill, burst, ascension, constellation } = own.char
  const { agg, iso, [data.key]: sheet } = reader.withAll('sheet', [])

  return [
    agg.reread(sheet),
    iso.reread(sheet),

    lvl.add(data.level),
    auto.add(data.talent.auto),
    skill.add(data.talent.skill),
    burst.add(data.talent.burst),
    ascension.add(data.ascension),
    constellation.add(data.constellation),

    // Default char
    ownBuff.premod.critRate_.add(0.05),
    ownBuff.premod.critDMG_.add(0.5),
  ]
}

export function weaponData(data: IWeapon): TagMapNodeEntries {
  const { lvl, ascension, refinement } = own.weapon

  return [
    reader.sheet('agg').reread(reader.sheet(data.key)),
    own.common.count.sheet(data.key).add(1),

    lvl.add(data.level),
    ascension.add(data.ascension),
    refinement.add(data.refinement),
  ]
}

export function artifactsData(
  data: {
    set: ArtifactSetKey
    stats: readonly { key: MainStatKey | SubstatKey; value: number }[]
  }[]
): TagMapNodeEntries {
  const {
    common: { count },
    premod,
  } = convert(ownTag, { sheet: 'art', et: 'own' })
  const { agg, art, dyn } = reader.withAll('sheet', [])
  const sets: Partial<Record<ArtifactSetKey, number>> = {},
    stats: Partial<Record<MainStatKey | SubstatKey, number>> = {}
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
    agg.reread(art), // Opt-in for artifact buffs, instead of enabling it by default to reduce `read` traffic

    // Add `sheet:dyn` between the stat and the buff so that we can `detach` them easily
    art.with('qt', 'premod').reread(dyn),
    ...Object.entries(stats).map(([k, v]) =>
      readStat(premod, k as MainStatKey | SubstatKey)
        .sheet('dyn')
        .add(v)
    ),

    ...Object.entries(sets).map(([k, v]) =>
      count.sheet(k as ArtifactSetKey).add(v)
    ),
  ]
}

/**
 * Generate conditional TagMapNodeEntry for calculator. Should be provided outside of any member data, in order to preserve specified 'src'
 * @param dst member to apply conditionals to
 * @param data conditional data in `Src: { Sheet: { CondKey: value } }` format. Src can be 'all', unless the buff is possibly duplicated (e.g. artifact team buff). In that case, you should specify the src member, if you want to select which one to apply.
 * @returns
 */
export function conditionalData(
  dst: Member,
  data: SrcCondInfo<Member, Sheet> | undefined
) {
  if (!data) return []
  return Object.entries(data).flatMap(([src, entries]) =>
    Object.entries(entries).flatMap(([sheet, entries]) => {
      const conds = conditionalEntries(sheet, src, dst)
      return Object.entries(entries).map(([k, v]) => conds(k, v))
    })
  )
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
        .reread(reader.withTag({ et: 'own', src: dst, dst: null }))
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
    // Resonance Team Buff
    own.reread(teamBuff.withTag({ et: 'teamBuff', sheet: 'reso', name: null })),
    // Non-stacking
    members.flatMap((src, i) => {
      const stackIn = reader.withTag({ qt: 'stackIn', ...stackListingNulls })
      const stackTmp = reader.withTag({ qt: 'stackTmp', ...stackListingNulls })
      // Make sure not to use `sheet:agg` here to match `stackOut` on the `reader.addOnce` side
      const own = reader.withTag({ src, et: 'own', ...stackListingNulls })
      // Use `i + 1` for priority so that `0` means no buff
      return [
        own.with('qt', 'stackTmp').add(cmpNE(stackIn, 0, i + 1)),
        own
          .with('qt', 'stackOut')
          .add(
            cmpEq(
              stackTmp.max.withTag({ et: 'team', ...stackListingNulls }),
              i + 1,
              stackIn
            )
          ),
      ]
    }),

    // Total Team Stat
    members.map((src) =>
      teamEntry.add(reader.withTag({ et: 'own', src, dst: null }))
    ),
  ].flat()
}
