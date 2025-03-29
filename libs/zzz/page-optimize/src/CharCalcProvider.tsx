import { notEmpty, objKeyMap, toDecimal } from '@genshin-optimizer/common/util'
import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import { FormulaTextCacheContext } from '@genshin-optimizer/game-opt/sheet-ui'
import { constant } from '@genshin-optimizer/pando/engine'
import { allDiscSetKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import type {
  CharOpt,
  DiscIds,
  ICachedCharacter,
} from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import {
  charTagMapNodeEntries,
  conditionalEntries,
  discTagMapNodeEntries,
  enemy,
  own,
  ownBuff,
  reader,
  teamData,
  wengineTagMapNodeEntries,
  withMember,
  withPreset,
  zzzCalculatorWithEntries,
} from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { discsTagMapNodes } from './discsTagMapNodes'

export function CharCalcProvider({
  character,
  charOpt,
  wengineId,
  discIds,
  children,
}: {
  character: ICachedCharacter
  charOpt: CharOpt
  wengineId?: string
  discIds: DiscIds
  children: ReactNode
}) {
  const member0 = useCharacterAndEquipment(character, wengineId, discIds)

  const calc = useMemo(
    () =>
      zzzCalculatorWithEntries([
        // Specify members present in the team
        ...teamData([character.key]),
        // Add actual member data
        ...member0,
        // TODO: Get enemy values from db
        ownBuff.common.critMode.add(charOpt.critMode),
        enemy.common.lvl.add(charOpt.enemyLvl),
        enemy.common.def.add(charOpt.enemyDef),
        enemy.common.isStunned.add(charOpt.enemyisStunned ? 1 : 0),
        enemy.common.stun_.add(charOpt.enemyStunMultiplier / 100),
        enemy.common.unstun_.add(1),
        ...charOpt.conditionals.flatMap(
          ({ sheet, src, dst, condKey, condValue }) =>
            withPreset(
              `preset0`,
              conditionalEntries(sheet, src, dst)(condKey, condValue)
            )
        ),
        ...charOpt.bonusStats.flatMap(({ tag, value }) =>
          withPreset(`preset0`, {
            // since bonusStats are applied to own*, needs {src:key, dst:never}
            tag: { ...tag, src: character.key, sheet: 'agg', et: 'own' },
            value: constant(toDecimal(value, tag.q ?? '')),
          })
        ),
        ...charOpt.enemyStats.flatMap(({ tag, value }) =>
          withPreset(`preset0`, {
            tag: { ...tag, qt: 'common', et: 'enemy', sheet: 'agg' },
            value: constant(toDecimal(value, tag.q ?? '')),
          })
        ),
      ]),
    [member0, charOpt, character.key]
  )
  // Refresh the formula text cache per calc
  const formulaTextCache = useMemo(() => calc && new Map(), [calc])

  return (
    <FormulaTextCacheContext.Provider value={formulaTextCache}>
      <CalcContext.Provider value={calc as Calculator}>
        {children}
      </CalcContext.Provider>
    </FormulaTextCacheContext.Provider>
  )
}

function useCharacterAndEquipment(
  character: ICachedCharacter,
  wengineId: string | undefined,
  discIds: DiscIds
) {
  const wengine = useWengine(wengineId)
  const discs = useDiscs(discIds)
  const wengineTagEntries = useMemo(() => {
    if (!wengine) return []
    return wengineTagMapNodeEntries(
      wengine.key,
      wengine.level,
      wengine.modification,
      wengine.phase
    )
  }, [wengine])
  const discTagEntries = useMemo(() => {
    if (!discs) return []
    return discsTagMapNodes(Object.values(discs).filter(notEmpty))
  }, [discs])
  return useMemo(() => {
    if (!character) return []
    return withMember(
      character.key,
      ...charTagMapNodeEntries(character),
      ...wengineTagEntries,
      ...discTagEntries
    )
  }, [character, wengineTagEntries, discTagEntries])
}

/**
 * A minimal Provider with all the disc sets and wengine count mocked
 */
export function CharCalcMockCountProvider({
  character,
  conditionals,
  children,
}: {
  character: ICachedCharacter
  conditionals: CharOpt['conditionals']
  children: ReactNode
}) {
  const calc = useMemo(
    () =>
      zzzCalculatorWithEntries([
        // Specify members present in the team
        ...teamData([character.key]),
        // Add actual member data
        ...withMember(
          character.key,
          ...charTagMapNodeEntries(character),
          ...discTagMapNodeEntries(
            {},
            objKeyMap(allDiscSetKeys, () => 4)
          ),
          // mock wengine
          // Opt-in for wengine buffs, instead of enabling it by default to reduce `read` traffic
          reader
            .sheet('agg')
            .reread(reader.sheet('wengine')),
          own.wengine.lvl.add(60),
          own.wengine.modification.add(5),
          own.wengine.phase.add(1),
          ...allWengineKeys.map((key) => own.common.count.sheet(key).add(1))
        ),
        // TODO: Get enemy values from db
        ownBuff.common.critMode.add('avg'),
        enemy.common.lvl.add(100),
        enemy.common.def.add(900),
        enemy.common.isStunned.add(0),
        enemy.common.stun_.add(1.5),
        enemy.common.unstun_.add(1),
        ...conditionals.flatMap(({ sheet, src, dst, condKey, condValue }) =>
          withPreset(
            `preset0`,
            conditionalEntries(sheet, src, dst)(condKey, condValue)
          )
        ),
      ]),
    [character, conditionals]
  )

  return (
    <CalcContext.Provider value={calc as Calculator}>
      {children}
    </CalcContext.Provider>
  )
}
