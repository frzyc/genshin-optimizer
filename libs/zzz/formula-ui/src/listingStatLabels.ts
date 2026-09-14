import type { StatKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'

/** Stat highlight key for listing stat rows (not named formula hits). */
export function statKeyFromListingTag(tag: Tag): StatKey | '' {
  if (tag.name) return ''
  if (tag.attribute) return `${tag.attribute}_${tag.q}` as StatKey
  if (tag.q === 'cappedCrit_') return 'crit_'
  if (tag.q === 'anom_cappedCrit_') return 'anom_crit_'
  return (tag.q ?? '') as StatKey
}
