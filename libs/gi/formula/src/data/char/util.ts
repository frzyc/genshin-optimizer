import type {
  CharacterKey,
  ElementKey,
  ElementWithPhyKey,
  MoveKey,
  RegionKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import { locCharKeyToCharKey } from '@genshin-optimizer/gi/consts'
import type { CharacterDataGen } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import { prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { FormulaArg, Stat, TagMapNodeEntries } from '../util'
import {
  allStatics,
  customDmg,
  customShield,
  listingItem,
  own,
  ownBuff,
  percent,
  readStat,
} from '../util'

export interface CharInfo {
  key: CharacterKey /* Might need to change this to CharacterSheetKey */
  ele: ElementKey
  weaponType: WeaponTypeKey
  region: RegionKey | ''
}
export function dataGenToCharInfo(
  data_gen: CharacterDataGen,
  travelerEle: ElementKey = 'anemo',
): CharInfo {
  return {
    key: locCharKeyToCharKey(data_gen.key, travelerEle),
    ele: data_gen.ele ?? travelerEle,
    weaponType: data_gen.weaponType,
    region: data_gen.region ?? '',
  }
}

export function dmg(
  name: string,
  info: CharInfo,
  stat: Stat,
  levelScaling: number[],
  move: Exclude<MoveKey, 'elemental'>,
  arg: { ele?: ElementWithPhyKey; baseMulti?: NumNode } & FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  let { ele } = arg
  if (!ele)
    switch (move) {
      case 'skill':
      case 'burst':
        ele = info.ele
        break
      default:
        switch (info.weaponType) {
          case 'catalyst':
            ele = info.ele
            break
          case 'bow':
            ele = 'physical'
            break
        }
    }

  const {
    char: { auto, skill, burst },
    final,
  } = own
  const talentByMove = {
    normal: auto,
    charged: auto,
    plunging: auto,
    skill,
    burst,
  } as const
  const talentMulti = percent(subscript(talentByMove[move], levelScaling))
  const base = prod(
    final[stat],
    talentMulti,
    ...(arg.baseMulti ? [arg.baseMulti] : []),
  )
  return customDmg(name, ele, move, base, arg, ...extra)
}

export function shield(
  name: string,
  stat: Stat,
  tlvlMulti: number[],
  flat: number[],
  talent: 'auto' | 'skill' | 'burst',
  arg: { ele?: ElementKey } & FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  const lvl = own.char[talent]
  return customShield(
    name,
    arg.ele,
    sum(
      prod(percent(subscript(lvl, tlvlMulti)), own.final[stat]),
      subscript(lvl, flat),
    ),
    arg,
    ...extra,
  )
}

export function fixedShield(
  name: string,
  base: Stat,
  percent: number | NumNode,
  flat: number | NumNode,
  arg: { ele?: ElementKey } & FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  return customShield(
    name,
    arg.ele,
    sum(prod(percent, own.final[base]), flat),
    arg,
    ...extra,
  )
}

const baseStats = new Set(['atk', 'def', 'hp'])

export function entriesForChar(
  { key, ele, weaponType, region }: CharInfo,
  { lvlCurves, ascensionBonus }: CharacterDataGen,
): TagMapNodeEntries {
  const specialized = new Set(Object.keys(ascensionBonus))
  specialized.delete('atk')
  specialized.delete('def')
  specialized.delete('hp')

  const { ascension } = own.char
  return [
    // Stats
    ...lvlCurves.map(({ key, base, curve }) =>
      ownBuff.base[key].add(prod(base, allStatics('static')[curve])),
    ),
    ...Object.entries(ascensionBonus).map(([key, values]) =>
      (baseStats.has(key)
        ? ownBuff.base[key as 'atk' | 'def' | 'hp']
        : readStat(ownBuff.premod, key)
      ).add(subscript(ascension, values)),
    ),

    // Constants
    ownBuff.common.weaponType.add(weaponType),
    ownBuff.char.ele.add(ele),

    // Counters
    ownBuff.common.count[ele].add(1),
    ...(region !== '' ? [ownBuff.common.count[region].add(1)] : []),

    // Listing (formulas)
    ownBuff.listing.formulas.add(listingItem(own.final.hp)),
    ownBuff.listing.formulas.add(listingItem(own.final.atk)),
    ownBuff.listing.formulas.add(listingItem(own.final.def)),
    ownBuff.listing.formulas.add(listingItem(own.final.eleMas)),
    ownBuff.listing.formulas.add(listingItem(own.final.enerRech_)),
    ownBuff.listing.formulas.add(listingItem(own.common.cappedCritRate_)),
    ownBuff.listing.formulas.add(listingItem(own.final.critDMG_)),
    ownBuff.listing.formulas.add(listingItem(own.final.heal_)),
    ownBuff.listing.formulas.add(listingItem(own.final.dmg_[ele])),
    ownBuff.listing.formulas.add(listingItem(own.final.dmg_.physical)),

    // Specialized stats, items here are sheet-specific data (i.e., `sheet:<key>`)
    // Read from `ownBuff` to include only sheet's contribution.
    ...[...specialized].map((stat) =>
      ownBuff.char.specialized.add(readStat(ownBuff.premod, stat).sheet(key)),
    ),
  ]
}
