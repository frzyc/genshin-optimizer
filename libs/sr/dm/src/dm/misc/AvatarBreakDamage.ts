import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH } from '../../consts'
import { readDMJSON } from '../../util'
import type { Value } from '../common'

export type AvatarBreakDamage = {
  Level: number
  BreakBaseDamage: Value
}

const avatarBreakDamage = JSON.parse(
  readDMJSON('ExcelOutput/AvatarBreakDamage.json'),
) as AvatarBreakDamage[]

dumpFile(`${PROJROOT_PATH}/src/dm/character/AvatarBreakDamage_list_gen.json`, [
  -1,
  ...avatarBreakDamage.map((config) => config.BreakBaseDamage.Value),
])
export { avatarBreakDamage }
