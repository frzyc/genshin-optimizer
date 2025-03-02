import { notEmpty } from '@genshin-optimizer/common/util'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import { constant } from '@genshin-optimizer/pando/engine'
import type { CharOpt, ICachedCharacter } from '@genshin-optimizer/sr/db'
import { useLightCone, useRelics } from '@genshin-optimizer/sr/db-ui'
import {
  charTagMapNodeEntries,
  conditionalEntries,
  enemyDebuff,
  lightConeTagMapNodeEntries,
  ownBuff,
  srCalculatorWithEntries,
  teamData,
  withMember,
  withPreset,
} from '@genshin-optimizer/sr/formula'
import { relicsTagMapNodes } from '@genshin-optimizer/sr/solver'
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
      srCalculatorWithEntries([
        // Specify members present in the team
        ...teamData([character.key]),
        // Add actual member data
        ...member0,
        // TODO: Get enemy values from db
        enemyDebuff.common.lvl.add(80),
        enemyDebuff.common.res.add(0.1),
        enemyDebuff.common.isBroken.add(0),
        enemyDebuff.common.maxToughness.add(100),
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
    [character.key, member0, charOpt.conditionals, charOpt.bonusStats]
  )

  return <CalcContext.Provider value={calc}>{children}</CalcContext.Provider>
}

function useCharacterAndEquipment(character: ICachedCharacter) {
  const lightCone = useLightCone(character?.equippedLightCone)
  const relics = useRelics(character?.equippedRelics)
  const lcTagEntries = useMemo(() => {
    const lc = lightCone
    if (!lc) return []
    return lightConeTagMapNodeEntries(
      lc.key,
      lc.level,
      lc.ascension,
      lc.superimpose
    )
  }, [lightCone])
  const relicTagEntries = useMemo(() => {
    if (!relics) return []
    return relicsTagMapNodes(Object.values(relics).filter(notEmpty))
  }, [relics])
  return useMemo(() => {
    if (!character) return []
    return withMember(
      character.key,
      ...charTagMapNodeEntries(character, 1),
      ...lcTagEntries,
      ...relicTagEntries
    )
  }, [character, lcTagEntries, relicTagEntries])
}
