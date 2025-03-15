import { objMap, toDecimal } from '@genshin-optimizer/common/util'
import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/consts'
import type { BuildTc, ICachedWeapon } from '@genshin-optimizer/gi/db'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import type { Data } from '@genshin-optimizer/gi/wr'
import { constant, percent } from '@genshin-optimizer/gi/wr'

export function getBuildTcArtifactData(buildTc: BuildTc): Data {
  const {
    artifact: {
      slots,
      substats: { stats: substats },
      sets,
    },
  } = buildTc
  const allStats: Partial<Record<MainStatKey | SubstatKey, number>> = objMap(
    substats,
    (v, k) => toDecimal(v, k),
  )
  Object.values(slots).forEach(
    ({ statKey, rarity, level }) =>
      (allStats[statKey] =
        (allStats[statKey] ?? 0) + getMainStatValue(statKey, rarity, level)),
  )
  return {
    art: objMap(allStats, (v, k) =>
      k.endsWith('_') ? percent(v) : constant(v),
    ),
    artSet: objMap(sets, (v) => constant(v)),
  }
}

export function getBuildTcWeaponData(buildTc: BuildTc): ICachedWeapon {
  const {
    weapon: { key, level, ascension, refinement },
  } = buildTc
  return {
    id: '',
    location: '',
    key,
    level,
    ascension,
    refinement,
    lock: false,
  }
}
