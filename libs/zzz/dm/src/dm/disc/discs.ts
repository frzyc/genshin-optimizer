import { dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import { nameToKey, objFilter, objMap } from '@genshin-optimizer/common/util'
import { PROJROOT_PATH } from '../../consts'
import { readHakushinJSON } from '../../util'
type discTrans = {
  name: string
  desc2: string
  desc4: string
}
const discsJsonData = JSON.parse(readHakushinJSON('equipment.json')) as Record<
  string,
  {
    icon: string
    EN: discTrans
    KO: discTrans
    CHS: discTrans
    JA: discTrans
  }
>

const discNames = Object.fromEntries(
  Object.values(discsJsonData).map(({ EN: { name } }) => [
    nameToKey(name),
    name,
  ])
)

dumpPrettyFile(`${PROJROOT_PATH}/src/dm/disc/discNames.json`, discNames)

const discIdMap = objFilter(
  objMap(discsJsonData, ({ EN: { name } }) => nameToKey(name)),
  (key) => !!key && !key.startsWith('EquipmentSuit')
)
dumpPrettyFile(`${PROJROOT_PATH}/src/dm/disc/discIdMap.json`, discIdMap)
dumpPrettyFile(
  `${PROJROOT_PATH}/src/dm/disc/discKeys.json`,
  Object.values(discIdMap).sort()
)

export { discsJsonData }
