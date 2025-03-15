import { deepClone, objKeyMap, objMap } from '@genshin-optimizer/common/util'
import { allMainStatKeys, allSubstatKeys } from '@genshin-optimizer/gi/consts'
import { input } from './formula'
import { setReadNodeKeys } from './utils'
const dynamic = setReadNodeKeys(
  deepClone({ dyn: { ...input.art, ...input.artSet } }),
)

// TODO: It may be better to use different dynamic data and add extra nodes to workerData during optimize so that you don't need to re-constant fold artifact set nodes later.
// https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138023281
export const dynamicData = {
  art: objKeyMap(
    [...allMainStatKeys, ...allSubstatKeys],
    (key) => dynamic.dyn[key],
  ),
  artSet: objMap(input.artSet, (_, key) => dynamic.dyn[key]),
}
