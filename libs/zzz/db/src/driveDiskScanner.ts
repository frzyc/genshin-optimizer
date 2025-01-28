// converting format of https://github.com/samsaq/ZZZ-Drive-Disk-Scanner to ZOD

import {
  isPercentStat,
  notEmpty,
  objFindValue,
} from '@genshin-optimizer/common/util'
import type { DiscRarityKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSubStatKeys,
  discSetNames,
  discSlotToMainStatKeys,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import type { IDisc, IZenlessObjectDescription } from './Interfaces'

type DDS = {
  set_name: string // 'Woodpecker Electro'
  partition_number: DiscSlotKey
  drive_rarity: DiscRarityKey
  drive_current_level: string //'15'
  drive_max_level: string //'15'
  drive_base_stat: string //'HP'
  drive_base_stat_number: string //'2200'
  drive_base_stat_combined: string //'HP 2,200'
  random_stats: Array<[string, string]>
  // [
  //   ['CRIT DMG+1', '9.6%'],
  //   ['PEN+3', 36.0],
  //   ['DEF', 15.0],
  //   ['HP', '3%']
  // ]
}
export function DDSToZOD(data: DDS[]): IZenlessObjectDescription {
  const discs = data
    .map(
      ({
        set_name,
        partition_number,
        drive_current_level,
        drive_rarity,
        drive_base_stat,
        random_stats,
      }) => {
        const setKey = objFindValue(discSetNames, set_name)
        if (!setKey) return null
        const slotKey = partition_number
        const mainStatKeys = discSlotToMainStatKeys[slotKey]
        if (!mainStatKeys) return null
        const mainStatKey =
          mainStatKeys.length === 1
            ? mainStatKeys[0]
            : mainStatKeys.find((k) => statKeyTextMap[k] === drive_base_stat)
        if (!mainStatKey) return null
        const substats = random_stats
          .map(([keyUp, subVal]) => {
            const isSubPercent =
              typeof subVal === 'string' && subVal.endsWith('%')
            const [keyStr, value] = keyUp.split('+')
            const upgrades = value ? parseInt(value) : 1
            const key = allDiscSubStatKeys.find(
              (k) =>
                isPercentStat(k) === isSubPercent &&
                statKeyTextMap[k] === keyStr
            )
            if (!key || !upgrades) return null
            return { key, upgrades }
          })
          .filter(notEmpty)
        return {
          setKey,
          slotKey,
          level: parseInt(drive_current_level),
          rarity: drive_rarity,
          mainStatKey,
          location: '',
          lock: false,
          trash: false,
          substats,
        } as IDisc
      }
    )
    .filter(notEmpty)

  return {
    format: 'ZOD',
    source: 'ZZZ-Drive-Disk-Scanner',
    version: 1,
    discs,
  }
}
