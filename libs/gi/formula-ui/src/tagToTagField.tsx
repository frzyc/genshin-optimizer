import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/gi/formula'
import { TagDisplay } from './components/TagDisplay'

export function tagToTagField(tag: Tag): TagField {
  return {
    title: <TagDisplay tag={tag} />,
    fieldRef: tag,
  }
}
