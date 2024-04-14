import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import type { WeaponData } from '@genshin-optimizer/gi/stats'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../Formula'
import { inferInfoMut, mergeData } from '../../Formula/api'
import type { Data, DisplaySub } from '../../Formula/type'
import { constant, infoMut, prod, subscript, sum } from '../../Formula/utils'
import KeyMap from '../../KeyMap'

export function dataObjForWeaponSheet(
  key: WeaponKey,
  gen: WeaponData,
  additional: Data = {},
  displayWeapon: DisplaySub = {}
): Data {
  const result: Data = {
    base: {},
    premod: {},
    total: {},
    weapon: {
      key: constant(key),
      type: constant(gen.weaponType),
    },
    display: {
      [`weapon:${key}`]: displayWeapon,
    },
  }

  const { mainStat, subStat } = gen
  const merging = [result]

  if (
    mainStat.type !== 'atk' &&
    mainStat.type !== 'def' &&
    mainStat.type !== 'hp'
  )
    throw new Error('Main stat type must be `atk`')
  const mainStatNode = infoMut(
    sum(
      prod(
        mainStat.base,
        subscript(input.weapon.lvl, allStats.weapon.expCurve[mainStat.curve])
      ),
      subscript(input.weapon.asc, gen.ascensionBonus['atk'] ?? [])
    ),
    KeyMap.info(mainStat.type)
  )
  merging.push({
    base: { [mainStat.type]: input.weapon.main },
    weapon: { main: mainStatNode },
  })

  if (subStat) {
    if (
      subStat.type === 'atk' ||
      subStat.type === 'def' ||
      subStat.type === 'hp'
    )
      throw new Error('SubStat cannot be `atk`, `def`, or `hp`')
    const substatNode = infoMut(
      prod(
        subStat.base,
        subscript(input.weapon.lvl, allStats.weapon.expCurve[subStat.curve])
      ),
      KeyMap.info(subStat.type)
    )
    merging.push({
      premod: { [subStat.type]: input.weapon.sub },
      weapon: { sub: substatNode },
    })
  }
  return mergeData([...merging, inferInfoMut(additional, key)])
}
