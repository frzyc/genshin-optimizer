import { notEmpty } from '@genshin-optimizer/common/util'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import { constant } from '@genshin-optimizer/pando/engine'
import type {
  DiscMainStatKey,
  DiscSetKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type {
  CharOpt,
  ICachedCharacter,
  ICachedDisc,
} from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import type { TagMapNodeEntries } from '@genshin-optimizer/zzz/formula'
import {
  charTagMapNodeEntries,
  conditionalEntries,
  discTagMapNodeEntries,
  enemyDebuff,
  ownBuff,
  teamData,
  wengineTagMapNodeEntries,
  withMember,
  withPreset,
  zzzCalculatorWithEntries,
} from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

export function CharCalcProvider({
  character,
  charOpt,
  children,
}: {
  character: ICachedCharacter
  charOpt: CharOpt
  children: ReactNode
}) {
  const member0 = useCharacterAndEquipment(character)

  const calc = useMemo(
    () =>
      zzzCalculatorWithEntries([
        // Specify members present in the team
        ...teamData([character.key]),
        // Add actual member data
        ...member0,
        // TODO: Get enemy values from db
        enemyDebuff.common.lvl.add(80),
        ownBuff.common.critMode.add('avg'),
        ...charOpt.conditionals.flatMap(
          ({ sheet, src, dst, condKey, condValue }) =>
            withPreset(
              `preset0`,
              conditionalEntries(sheet, src, dst)(condKey, condValue)
            )
        ),
        ...charOpt.bonusStats.flatMap(({ tag, value }) =>
          withPreset(`preset0`, {
            tag: { ...tag },
            value: constant(value),
          })
        ),
      ]),
    [member0, charOpt, character.key]
  )

  return <CalcContext.Provider value={calc}>{children}</CalcContext.Provider>
}

function useCharacterAndEquipment(character: ICachedCharacter) {
  const wengine = useWengine(character?.equippedWengine)
  const discs = useDiscs(character?.equippedDiscs)
  const wengineTagEntries = useMemo(() => {
    const we = wengine
    if (!we) return []
    return wengineTagMapNodeEntries(we.key, we.level, we.modification, we.phase)
  }, [wengine])
  const relicTagEntries = useMemo(() => {
    if (!discs) return []
    return discsTagMapNodes(Object.values(discs).filter(notEmpty))
  }, [discs])
  return useMemo(() => {
    if (!character) return []
    return withMember(
      character.key,
      ...charTagMapNodeEntries(character),
      ...wengineTagEntries,
      ...relicTagEntries
    )
  }, [character, wengineTagEntries, relicTagEntries])
}

export function discsTagMapNodes(discs: ICachedDisc[]): TagMapNodeEntries {
  const sets: Partial<Record<DiscSetKey, number>> = {},
    stats: Partial<Record<DiscMainStatKey | DiscSubStatKey, number>> = {}
  discs.forEach(({ setKey, mainStatKey, substats, level, rarity }) => {
    sets[setKey] = (sets[setKey] ?? 0) + 1
    stats[mainStatKey] =
      (stats[mainStatKey] ?? 0) + getDiscMainStatVal(rarity, mainStatKey, level)
    substats.forEach(({ key, upgrades }) => {
      if (!key || !upgrades) return
      stats[key] =
        (stats[key] ?? 0) + getDiscSubStatBaseVal(key, rarity) * upgrades
    })
  })
  return discTagMapNodeEntries(stats, sets)
}
