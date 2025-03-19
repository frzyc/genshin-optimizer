import type { Tag as BaseTag } from '@genshin-optimizer/game-opt/engine'
import {
  Read as BaseRead,
  reader as baseReader,
  entryTypes,
  presets,
  setReader,
} from '@genshin-optimizer/game-opt/engine'
import {
  allAmplifyingReactionKeys,
  allCatalyzeReactionKeys,
  allElementWithPhyKeys,
  allMoveKeys,
  allRegionKeys,
  allTransformativeReactionKeys,
} from '@genshin-optimizer/gi/consts'
import type { Dst, Sheet, Src } from './listing'
import { members, sheets } from './listing'

export const fixedTags = {
  preset: presets,
  src: members,
  dst: members,
  et: entryTypes,
  sheet: sheets,

  region: allRegionKeys,
  ele: allElementWithPhyKeys,
  move: allMoveKeys,
  trans: allTransformativeReactionKeys,
  amp: [...allAmplifyingReactionKeys, ''],
  cata: [...allCatalyzeReactionKeys, ''],
} as const
export type Tag = BaseTag<Sheet, Src, Dst>

export class Read extends BaseRead<Tag> {
  override toString(): string {
    return tagStr(this.tag, this.ex)
  }

  // Optional Modifiers

  // Move
  get normal(): Read {
    return super.with('move', 'normal')
  }
  get charged(): Read {
    return super.with('move', 'charged')
  }
  get plunging(): Read {
    return super.with('move', 'plunging')
  }
  get skill(): Read {
    return super.with('move', 'skill')
  }
  get burst(): Read {
    return super.with('move', 'burst')
  }
  get elemental(): Read {
    return super.with('move', 'elemental')
  }

  // Element
  get anemo(): Read {
    return super.with('ele', 'anemo')
  }
  get pyro(): Read {
    return super.with('ele', 'pyro')
  }
  get hydro(): Read {
    return super.with('ele', 'hydro')
  }
  get geo(): Read {
    return super.with('ele', 'geo')
  }
  get cryo(): Read {
    return super.with('ele', 'cryo')
  }
  get electro(): Read {
    return super.with('ele', 'electro')
  }
  get dendro(): Read {
    return super.with('ele', 'dendro')
  }
  get physical(): Read {
    return super.with('ele', 'physical')
  }

  // Reaction
  get overloaded(): Read {
    return super.with('trans', 'overloaded')
  }
  get shattered(): Read {
    return super.with('trans', 'shattered')
  }
  get electrocharged(): Read {
    return super.with('trans', 'electrocharged')
  }
  get superconduct(): Read {
    return super.with('trans', 'superconduct')
  }
  get swirl(): Read {
    return super.with('trans', 'swirl')
  }
  get burning(): Read {
    return super.with('trans', 'burning')
  }
  get bloom(): Read {
    return super.with('trans', 'bloom')
  }
  get burgeon(): Read {
    return super.with('trans', 'burgeon')
  }
  get hyperbloom(): Read {
    return super.with('trans', 'hyperbloom')
  }
  get vaporize(): Read {
    return super.with('amp', 'vaporize')
  }
  get melt(): Read {
    return super.with('amp', 'melt')
  }
  get spread(): Read {
    return super.with('cata', 'spread')
  }
  get aggravate(): Read {
    return super.with('cata', 'aggravate')
  }

  // Region
  get mondstadt(): Read {
    return super.with('region', 'mondstadt')
  }
  get liyue(): Read {
    return super.with('region', 'liyue')
  }
  get inazuma(): Read {
    return super.with('region', 'inazuma')
  }
  get sumeru(): Read {
    return super.with('region', 'sumeru')
  }
  get fontaine(): Read {
    return super.with('region', 'fontaine')
  }
  get natlan(): Read {
    return super.with('region', 'natlan')
  }
  get snezhnaya(): Read {
    return super.with('region', 'snezhnaya')
  }
  get khaenriah(): Read {
    return super.with('region', 'khaenriah')
  }
}

// Need to instantiate with gi-specific reader
setReader<Tag>(new Read({}, undefined))
export const reader = baseReader as Read

export function tagStr(tag: Tag, ex?: any): string {
  const {
    name,
    preset,
    src,
    dst,
    et,
    sheet,
    region,
    ele,
    q,
    qt,
    move,
    trans,
    amp,
    cata,
    ...remaining
  } = tag

  if (Object.keys(remaining).length) console.error(remaining)

  let result = '{ ',
    includedRequired = false,
    includedBar = false
  function required(str: string | undefined | null, name: string) {
    if (!str && str !== null) return
    result += str === null ? `!${name} ` : `${str} `
    includedRequired = true
  }
  function optional(str: string | undefined | null, name: string) {
    if (!str && str !== null) return
    if (includedRequired && !includedBar) {
      includedBar = true
      result += '| '
    }
    result += str === null ? `!${name} ` : `${str} `
  }
  required(name && `#${name}`, 'name')
  required(preset, 'preset')
  required(src, 'src')
  required(dst && `(${dst})`, 'dst')
  required(sheet, 'sheet')
  required(et, 'et')
  if (qt && q) required(`${qt}.${q}`, '')
  else if (qt) required(`${qt}.`, '')
  else if (q) required(`.${q}`, '')

  optional(region, 'region')
  optional(move, 'move')
  optional(ele, 'ele')
  optional(trans, 'trans')
  optional(amp, 'amp')
  optional(cata, 'cata')
  if (ex) result += `[${ex}] `
  return `${result}}`
}
