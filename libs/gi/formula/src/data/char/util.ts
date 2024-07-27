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
  percent,
  readStat,
  self,
} from '../util'

export interface CharInfo {
  key: CharacterKey /* Might need to change this to CharacterSheetKey */
  ele: ElementKey
  weaponType: WeaponTypeKey
  region: RegionKey | ''
}
export function dataGenToCharInfo(
  data_gen: CharacterDataGen,
  travelerEle: ElementKey = 'anemo'
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
  } = self
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
    ...(arg.baseMulti ? [arg.baseMulti] : [])
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
  const lvl = self.char[talent]
  return customShield(
    name,
    arg.ele,
    sum(
      prod(percent(subscript(lvl, tlvlMulti)), self.final[stat]),
      subscript(lvl, flat)
    ),
    arg,
    ...extra
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
    sum(prod(percent, self.final[base]), flat),
    arg,
    ...extra
  )
}

const baseStats = new Set(['atk', 'def', 'hp'])

export function entriesForChar(
  { key, ele, weaponType, region }: CharInfo,
  { lvlCurves, ascensionBonus }: CharacterDataGen
): TagMapNodeEntries {
  const specialized = new Set(
    Object.keys(ascensionBonus) as (keyof typeof ascensionBonus)[]
  )
  specialized.delete('atk')
  specialized.delete('def')
  specialized.delete('hp')

  // Use `self` here instead of `selfBuff` so that the number is
  // still available even when the buff mechanism does not apply
  const { ascension } = self.char
  return [
    // Stats
    ...lvlCurves.map(({ key, base, curve }) =>
      self.base[key].add(prod(base, allStatics('static')[curve]))
    ),
    ...Object.entries(ascensionBonus).map(([key, values]) =>
      (baseStats.has(key)
        ? self.base[key as 'atk' | 'def' | 'hp']
        : readStat(self.premod, key as keyof typeof ascensionBonus)
      ).add(subscript(ascension, values))
    ),

    // Constants
    self.common.weaponType.add(weaponType),
    self.char.ele.add(ele),

    // Counters
    self.common.count[ele].add(1),
    ...(region !== '' ? [self.common.count[region].add(1)] : []),

    // Listing (formulas)
    self.listing.formulas.add(listingItem(self.final.hp)),
    self.listing.formulas.add(listingItem(self.final.atk)),
    self.listing.formulas.add(listingItem(self.final.def)),
    self.listing.formulas.add(listingItem(self.final.eleMas)),
    self.listing.formulas.add(listingItem(self.final.enerRech_)),
    self.listing.formulas.add(listingItem(self.common.cappedCritRate_)),
    self.listing.formulas.add(listingItem(self.final.critDMG_)),
    self.listing.formulas.add(listingItem(self.final.heal_)),
    self.listing.formulas.add(listingItem(self.final.dmg_[ele])),
    self.listing.formulas.add(listingItem(self.final.dmg_.physical)),

    // Listing (specialized)
    ...[...specialized].map((stat) =>
      // Sheet-specific data (i.e., `sheet:<key>`)
      self.char.specialized.add(readStat(self.premod, stat).sheet(key))
    ),
  ]
}
