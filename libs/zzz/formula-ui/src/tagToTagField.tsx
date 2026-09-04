import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { TagTitle } from './components/TagTitle'

export function tagToTagField(tag: Tag): TagField {
  return {
    title: <TagTitle tag={tag} />,
    fieldRef: tag,
  }
}
