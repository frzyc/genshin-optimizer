import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { TagMapSubset } from '@genshin-optimizer/pando/engine'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { buildTagFieldMaps } from './buildTagFieldMaps'

type TagFieldMap = TagMapSubset<TagField>

const { tagFieldMap: tagFieldMapInstance, condMap: condMapInstance } =
  buildTagFieldMaps()

export function getTagFieldMap(): TagFieldMap {
  return tagFieldMapInstance
}

export function tagFieldSubset(tag: Tag) {
  return tagFieldMapInstance.subset(tag)
}

export function getCondMap() {
  return condMapInstance
}
