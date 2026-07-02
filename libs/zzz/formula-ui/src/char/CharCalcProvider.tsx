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
  DiscIds,
  ICachedCharacter,
  Team,
  TeamConditional,
  OptFrame,
} from '@genshin-optimizer/zzz/db'
import { getTeamFrame0, teamCharacterKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharacter,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import type { TagMapNodeEntries } from '@genshin-optimizer/zzz/formula'
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
import { allStats } from '@genshin-optimizer/zzz/stats'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { FullTagDisplay, TagDisplay } from '../components'
import { formulaText } from '../formulaText'

const EMPTY_ENTRIES: TagMapNodeEntries = []

export function CharCalcProvider({
  character,
  team,
  wengineId,
  discIds,
  children,
}: {
  character: ICachedCharacter
  team: Team
  wengineId?: string
  discIds: DiscIds
  children: ReactNode
}) {
  const member0 = useCharacterAndEquipment(character, wengineId, discIds)
  const fullTeammateEntries = useFullTeammateMemberEntries(team, character.key)

  const calc = useMemo(
    () =>
      zzzCalculatorWithEntries(
        buildTeamCalculatorEntries({
          character,
          team,
          member0,
          fullTeammateEntries,
        })
      ),
    [member0, fullTeammateEntries, team, character.key]
  )
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

function buildTeamCalculatorEntries({
  character,
  team,
  member0,
  fullTeammateEntries = EMPTY_ENTRIES,
}: {
  character: ICachedCharacter
  team: Team
  member0: TagMapNodeEntries
  fullTeammateEntries?: TagMapNodeEntries
}) {
  const frames = team.frames.length > 0 ? team.frames : [getTeamFrame0(team)]
  return [
    ...teamData(teamCharacterKeys(team)),
    ...member0,
    // Teammate char + wengine + disc entries (src = teammate) for team-buff formulas.
    ...fullTeammateEntries,
    ...enemyStatEntries(team),
    ...frames.flatMap((frame, index) =>
      presetFrameEntries(frame, presets[index] ?? 'preset0', character.key)
    ),
    ...teammateCountEntries(team, character.key),
  ]
}

function enemyStatEntries(team: Team): TagMapNodeEntries {
  return [
    enemy.common.lvl.add(team.enemyLvl),
    enemy.common.def.add(team.enemyDef),
    enemy.common.stun_.add(team.enemyStunMultiplier / 100),
    enemy.common.unstun_.add(1),
  ]
}

function presetFrameEntries(
  frame: OptFrame,
  preset: (typeof presets)[number],
  characterKey: CharacterKey
): TagMapNodeEntries {
  return [
    ...withPreset(preset, ownBuff.common.critMode.add(frame.critMode)),
    ...frame.conditionals.flatMap(({ sheet, src, dst, condKey, condValue }) =>
      withPreset(
        preset,
        conditionalEntries(sheet, src, dst)(condKey, condValue)
      )
    ),
    ...frame.bonusStats
      .filter(({ disabled }) => !disabled)
      .flatMap(({ tag, value }) =>
        withPreset(preset, {
          // bonusStats apply to own*; needs { src: key, dst: never }.
          tag: { ...tag, src: characterKey, sheet: 'agg', et: 'own' },
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
}

function teammateCountEntries(team: Team, mainCharacterKey: CharacterKey) {
  // Non-main teammates only; main counts come from charTagMapNodeEntries in member0.
  return team.teammates
    .filter(({ characterKey }) => characterKey !== mainCharacterKey)
    .flatMap(({ characterKey }) => teammateCountEntriesForChar(characterKey))
}

function teammateCountEntriesForChar(charKey: CharacterKey) {
  const { specialty, faction, attribute } = allStats.char[charKey]
  return [
    ownBuff.common.count.withSpecialty(specialty).add(1),
    ownBuff.common.count.withFaction(faction).add(1),
    ownBuff.common.count.withTag({ attribute }).add(1),
  ]
}

function useFullTeammateMemberEntries(team: Team, mainCharacterKey: CharacterKey) {
  // Optimize page teammate slots are indexed 1 and 2 in team.teammates.
  const slot1Entries = useTeammateMemberEntries(
    team.teammates[1]?.characterKey,
    mainCharacterKey
  )
  const slot2Entries = useTeammateMemberEntries(
    team.teammates[2]?.characterKey,
    mainCharacterKey
  )
  return useMemo(
    () => [...slot1Entries, ...slot2Entries],
    [slot1Entries, slot2Entries]
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

function useCharacterAndEquipment(
  character: ICachedCharacter | undefined,
  wengineId: string | undefined,
  discIds: DiscIds
) {
  const { wengineTagEntries, discTagEntries } = useEquipmentTagEntries(
    wengineId,
    discIds
  )
  return useMemo(
    () =>
      character
        ? memberAndEquipmentEntries(
            character,
            wengineTagEntries,
            discTagEntries
          )
        : EMPTY_ENTRIES,
    [character, wengineTagEntries, discTagEntries]
  )
}

function useTeammateMemberEntries(
  teammateKey: CharacterKey | undefined,
  mainCharacterKey: CharacterKey
) {
  // Load teammate build so team-buff formulas can resolve with src = teammateKey.
  const character = useCharacter(teammateKey)
  const { wengineTagEntries, discTagEntries } = useEquipmentTagEntries(
    character?.equippedWengine,
    character?.equippedDiscs ?? {}
  )
  return useMemo(() => {
    if (!character || !teammateKey || teammateKey === mainCharacterKey)
      return EMPTY_ENTRIES
    return memberAndEquipmentEntries(
      character,
      wengineTagEntries,
      discTagEntries
    )
  }, [
    character,
    teammateKey,
    mainCharacterKey,
    wengineTagEntries,
    discTagEntries,
  ])
}

function useEquipmentTagEntries(wengineId: string | undefined, discIds: DiscIds) {
  const wengine = useWengine(wengineId)
  const discs = useDiscs(discIds)
  const wengineTagEntries = useMemo(
    () => wengineTagMapNodeEntries(wengine),
    [wengine]
  )
  const discTagEntries = useMemo(
    () => discsToTagMapNodeEntries(Object.values(discs).filter(notEmpty)),
    [discs]
  )
  return { wengineTagEntries, discTagEntries }
}

function memberAndEquipmentEntries(
  character: ICachedCharacter,
  wengineTagEntries: TagMapNodeEntries,
  discTagEntries: TagMapNodeEntries
): TagMapNodeEntries {
  return withMember(
    character.key,
    ...charTagMapNodeEntries(character),
    ...wengineTagEntries,
    ...discTagEntries
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
