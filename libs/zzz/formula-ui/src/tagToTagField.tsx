import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { resolveTagTitleCore } from './components/resolveTagTitleCore'

/** Sheet field row — uses fallback labels only (no tagFieldMap lookup). */
export function tagToTagField(tag: Tag): TagField {
  return {
    title: resolveTagTitleCore(tag),
    fieldRef: tag,
  }
}
