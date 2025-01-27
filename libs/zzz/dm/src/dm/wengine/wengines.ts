import { dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import { nameToKey, objFilter, objMap } from '@genshin-optimizer/common/util'
import { PROJROOT_PATH } from '../../consts'
import { readHakushinJSON } from '../../util'

const wenginesJsonData = JSON.parse(readHakushinJSON('weapon.json')) as Record<
  string,
  {
    EN: string
  }
>

const wengineIdMap = objFilter(
  objMap(wenginesJsonData, ({ EN }) => nameToKey(EN)),
  (key) => !!key && !key.startsWith('ItemWeapon')
)

dumpPrettyFile(
  `${PROJROOT_PATH}/src/dm/wengine/wengineIdMap.json`,
  wengineIdMap
)
dumpPrettyFile(
  `${PROJROOT_PATH}/src/dm/wengine/wengineKeys.json`,
  Object.values(wengineIdMap).sort()
)

export { wenginesJsonData }
