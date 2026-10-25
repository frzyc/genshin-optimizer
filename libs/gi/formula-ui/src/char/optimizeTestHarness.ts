import type {
  CharacterKey,
  WeaponKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import type { Calculator, Tag } from '@genshin-optimizer/gi/formula'
import {
  artifactsData,
  charData,
  enemyDebuff,
  genshinCalculatorWithEntries,
  own,
  ownBuff,
  pandoContextEntries,
  teamData,
  travelerMemberSrcs,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { ICharacter, IWeapon } from '@genshin-optimizer/gi/good'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { isValidElement } from 'react'
import { joinCatalogRows } from '../catalogListing'
import { TagDisplay } from '../components/TagDisplay'
import { tagFieldSubset } from './tagFieldMap'
import { getTagLabel, tagLabelStr } from '../tagLabel'

const DEFAULT_WEAPON_BY_TYPE: Record<WeaponTypeKey, WeaponKey> = {
  sword: 'DullBlade',
  claymore: 'WasterGreatsword',
  polearm: 'BeginnersProtector',
  bow: 'HuntersBow',
  catalyst: 'ApprenticesNotes',
}

function defaultCharacter(charKey: CharacterKey): ICharacter {
  return {
    key: charKey,
    level: 90,
    talent: { auto: 9, skill: 9, burst: 9 },
    ascension: 6,
    constellation: 6,
  }
}

function defaultWeapon(charKey: CharacterKey): IWeapon {
  const weaponType = getCharStat(charKey).weaponType
  const key = DEFAULT_WEAPON_BY_TYPE[weaponType]
  return {
    key,
    level: 90,
    ascension: 6,
    refinement: 1,
    location: charKey as IWeapon['location'],
    lock: false,
  }
}

/** Minimal GI Pando calc for optimize-panel listing smoke tests. */
export function buildOptimizePageCalc(charKey: CharacterKey): Calculator {
  const char = defaultCharacter(charKey)
  const weapon = defaultWeapon(charKey)
  return genshinCalculatorWithEntries([
    ...teamData(['0']),
    ...withMember(
      '0',
      ...charData(char),
      ...weaponData(weapon),
      ...artifactsData([])
    ),
    enemyDebuff.reaction.cata.add(''),
    enemyDebuff.reaction.amp.add(''),
    enemyDebuff.common.lvl.add(90),
    enemyDebuff.common.preRes.add(0.1),
    ownBuff.common.critMode.add('avg'),
    ...pandoContextEntries({
      memberKeys: ['0'],
      travelerSrcs: travelerMemberSrcs([{ src: '0', charKey }]),
    }),
  ]).withTag({ src: '0' })
}

export const UNRESOLVED_TAG_LABEL_RE =
  /\[gi-formula-ui\] Unresolved tag label: expected a KeyMap entry or sheet title/

/** Listing names covered by the auto-section sheet port (normal / charged / plunging). */
export const AUTO_LISTING_LABEL_RE = /^(normal_\d+|charged_|plunging_)/

export type UnresolvedTagLabelCall = [
  string,
  { tag: { sheet?: string; name?: string | null }; label: string },
]

const STAT_SHEET = 'stat'

export function isAutoListingLabel(label: string): boolean {
  return AUTO_LISTING_LABEL_RE.test(label)
}

/** Same resolution path as `TagDisplay` (sheet title, then KeyMap / listing fallback). */
export function isOptimizeListingLabelResolved(tag: Tag): boolean {
  for (const field of tagFieldSubset(tag)) {
    const title = field.title
    if (title == null || (isValidElement(title) && title.type === TagDisplay)) {
      continue
    }
    return true
  }
  const label = getTagLabel(tag)
  return !!label && !!tagLabelStr(label)
}

export type UnresolvedOptimizeLabel = {
  name: string
  label: string
  tag: Tag
}

/** Catalog rows shown on the optimize panel whose labels would warn in dev. */
export function listUnresolvedOptimizeCatalogLabels(
  characterKey: CharacterKey,
  calc: Calculator
): UnresolvedOptimizeLabel[] {
  const reads = calc.listFormulas(own.listing.formulas)
  const rows = joinCatalogRows(characterKey, reads)
  const unresolved: UnresolvedOptimizeLabel[] = []
  for (const row of rows) {
    for (const [, read] of row.reads) {
      const tag = read.tag
      if (isOptimizeListingLabelResolved(tag)) continue
      unresolved.push({
        name: row.entry.name,
        label: getTagLabel(tag),
        tag,
      })
    }
  }
  return unresolved
}

export function filterUnresolvedTagLabelCalls(
  calls: unknown[][],
  opts?: { autoOnly?: boolean; characterKey?: CharacterKey }
): UnresolvedTagLabelCall[] {
  return calls.filter((call): call is UnresolvedTagLabelCall => {
    if (typeof call[0] !== 'string' || !UNRESOLVED_TAG_LABEL_RE.test(call[0])) {
      return false
    }
    const detail = call[1]
    if (!detail || typeof detail !== 'object' || !('label' in detail)) {
      return false
    }
    const { label, tag } = detail as UnresolvedTagLabelCall[1]
    if (opts?.characterKey) {
      const sheet = tag.sheet
      if (sheet !== opts.characterKey && sheet !== STAT_SHEET) return false
    }
    if (opts?.autoOnly && !isAutoListingLabel(label)) return false
    return true
  })
}
