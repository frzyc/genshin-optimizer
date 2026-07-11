import { notEmpty, objKeyMap, toDecimal } from '@genshin-optimizer/common/util'
import type {
  CalcMeta,
  Calculator,
  Tag,
} from '@genshin-optimizer/game-opt/engine'
import { presets } from '@genshin-optimizer/game-opt/engine'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { FormulaText } from '@genshin-optimizer/game-opt/sheet-ui'
import type {
  FormulaTextFunc,
  FullTagDisplayComponent,
  TagDisplayComponent,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  FormulaTextCacheContext,
  FormulaTextContext,
  FullTagDisplayContext,
  TagDisplayContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CalcResult } from '@genshin-optimizer/pando/engine'
import { constant } from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSetKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import type {
  ICachedCharacter,
  Team,
  TeamConditional,
} from '@genshin-optimizer/zzz/db'
import { getTeamFrame0, teamCharacterKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharacter,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import {
  charTagMapNodeEntries,
  conditionalEntries,
  discTagMapNodeEntries,
  discsToTagMapNodeEntries,
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
import { FullTagDisplay, TagDisplay } from '../components'
import { formulaText } from '../formulaText'

export function CharCalcProvider({
  team,
  children,
}: {
  team: Team
  children: ReactNode
}) {
  const member0 = useCharacterAndEquipment(team.teammates[0].characterKey)
  const member1 = useCharacterAndEquipment(
    team.teammates.length > 1 ? team.teammates[1].characterKey : undefined
  )
  const member2 = useCharacterAndEquipment(
    team.teammates.length > 2 ? team.teammates[2].characterKey : undefined
  )

  const calc = useMemo(() => {
    const frames = team.frames.length > 0 ? team.frames : [getTeamFrame0(team)]
    return zzzCalculatorWithEntries([
      ...teamData(teamCharacterKeys(team)),
      ...member0,
      enemy.common.lvl.add(team.enemyLvl),
      enemy.common.def.add(team.enemyDef),
      enemy.common.stun_.add(team.enemyStunMultiplier / 100),
      enemy.common.unstun_.add(1),
      ...frames.flatMap((frame, i) => {
        const preset = presets[i] ?? 'preset0'
        return [
          ...withPreset(preset, ownBuff.common.critMode.add(frame.critMode)),
          ...frame.conditionals.flatMap(
            ({ sheet, src, dst, condKey, condValue }) =>
              withPreset(
                preset,
                conditionalEntries(sheet, src, dst)(condKey, condValue)
              )
          ),
          ...frame.bonusStats
            .filter(({ disabled }) => !disabled)
            .flatMap(({ tag, value }) =>
              withPreset(preset, {
                // since bonusStats are applied to own*, needs {src:key, dst:never}
                tag: {
                  ...tag,
                  src: team.teammates[0].characterKey,
                  sheet: 'agg',
                  et: 'own',
                },
                value: constant(toDecimal(value, tag.q ?? '')),
              })
            ),
          ...frame.enemyStats.flatMap(({ tag, value }) =>
            withPreset(preset, {
              tag: { ...tag, qt: 'common', et: 'enemy', sheet: 'agg' },
              value: constant(toDecimal(value, tag.q ?? '')),
            })
          ),
        ]
      }),
      // Teammates
      ...member1,
      ...member2,
    ])
  }, [team, member0, member1, member2])
  // New map per calc so formula tooltips do not reuse stale nodes after gear/opt changes.
  const formulaTextCache = useMemo(() => calc && new Map(), [calc])

  return (
    <ZzzSheetUiProviders formulaTextCache={formulaTextCache}>
      <CalcContext.Provider value={calc as Calculator}>
        {children}
      </CalcContext.Provider>
    </ZzzSheetUiProviders>
  )
}

function ZzzSheetUiProviders({
  children,
  formulaTextCache,
}: {
  children: ReactNode
  formulaTextCache: Map<CalcResult<number, CalcMeta<Tag, never>>, FormulaText>
}) {
  return (
    <FormulaTextCacheContext.Provider value={formulaTextCache}>
      <FormulaTextContext.Provider value={formulaText as FormulaTextFunc}>
        <TagDisplayContext.Provider value={TagDisplay as TagDisplayComponent}>
          <FullTagDisplayContext.Provider
            value={FullTagDisplay as FullTagDisplayComponent}
          >
            {children}
          </FullTagDisplayContext.Provider>
        </TagDisplayContext.Provider>
      </FormulaTextContext.Provider>
    </FormulaTextCacheContext.Provider>
  )
}

function useCharacterAndEquipment(characterKey: CharacterKey | undefined) {
  const character = useCharacter(characterKey)
  const wengine = useWengine(character?.equippedWengine)
  const discs = useDiscs(character?.equippedDiscs)
  const wengineTagEntries = useMemo(
    () => wengineTagMapNodeEntries(wengine),
    [wengine]
  )
  const discTagEntries = useMemo(
    () => discsToTagMapNodeEntries(Object.values(discs).filter(notEmpty)),
    [discs]
  )
  return useMemo(
    () =>
      character
        ? withMember(
            character.key,
            ...charTagMapNodeEntries(character),
            ...wengineTagEntries,
            ...discTagEntries
          )
        : [],
    [character, wengineTagEntries, discTagEntries]
  )
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
  conditionals: readonly TeamConditional[]
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

  const formulaTextCache = useMemo(() => calc && new Map(), [calc])

  return (
    <ZzzSheetUiProviders formulaTextCache={formulaTextCache}>
      <CalcContext.Provider value={calc as Calculator}>
        {children}
      </CalcContext.Provider>
    </ZzzSheetUiProviders>
  )
}
