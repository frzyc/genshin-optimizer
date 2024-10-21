import { constant } from '@genshin-optimizer/pando/engine'
import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import type {
  CharacterKey,
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import type {
  ComboMetaDataum,
  ICachedCharacter,
  ICachedLightCone,
  ICachedRelic,
} from '@genshin-optimizer/sr/db'
import type {
  Member,
  Preset,
  TagMapNodeEntries,
} from '@genshin-optimizer/sr/formula'
import {
  charData,
  conditionalEntries,
  enemyDebuff,
  lightConeData,
  members,
  ownBuff,
  relicsData,
  srCalculatorWithEntries,
  teamData,
  withMember,
  withPreset,
} from '@genshin-optimizer/sr/formula'
import {
  useBuild,
  useCharacter,
  useCombo,
  useEquippedRelics,
  useLightCone,
} from '@genshin-optimizer/sr/ui'
import type { ReactNode } from 'react'
import { useContext, useMemo } from 'react'
import { PresetContext } from './context'

type CharacterFullData = {
  character: ICachedCharacter | undefined
  lightCone: ICachedLightCone | undefined
  relics: Record<RelicSlotKey, ICachedRelic | undefined>
}

export function TeamCalcProvider({
  comboId,
  currentChar,
  children,
}: {
  comboId: string
  currentChar?: CharacterKey
  children: ReactNode
}) {
  const combo = useCombo(comboId)!
  const { presetIndex } = useContext(PresetContext)
  const member0 = useCharacterAndEquipment(combo.comboMetadata[0])
  const member1 = useCharacterAndEquipment(combo.comboMetadata[1])
  const member2 = useCharacterAndEquipment(combo.comboMetadata[2])
  const member3 = useCharacterAndEquipment(combo.comboMetadata[3])

  const calc = useMemo(
    () =>
      srCalculatorWithEntries([
        // Specify members present in the team
        ...teamData(
          combo.comboMetadata
            .map((meta, index) =>
              meta === undefined ? undefined : members[index]
            )
            .filter((m): m is Member => !!m)
        ),
        // Add actual member data
        ...(member0 ? createMember(member0) : []),
        ...(member1 ? createMember(member1) : []),
        ...(member2 ? createMember(member2) : []),
        ...(member3 ? createMember(member3) : []),
        // TODO: Get these from db
        enemyDebuff.common.lvl.add(80),
        enemyDebuff.common.res.add(0.1),
        enemyDebuff.common.isBroken.add(0),
        enemyDebuff.common.maxToughness.add(100),
        ownBuff.common.critMode.add('avg'),
        ...combo.conditionals.flatMap(
          ({ sheet, src, dst, condKey, condValues }) =>
            condValues.flatMap((condValue, frameIndex) =>
              withPreset(
                `preset${frameIndex}` as Preset,
                conditionalEntries(sheet, src, dst)(condKey, condValue)
              )
            )
        ),
        ...combo.bonusStats.flatMap(({ tag, values }) =>
          values.flatMap((value, frameIndex) =>
            withPreset(`preset${frameIndex}` as Preset, {
              tag: { ...tag },
              value: constant(value),
            })
          )
        ),
      ]),
    [combo, member0, member1, member2, member3]
  )

  const calcWithTag = useMemo(
    () =>
      (currentChar &&
        calc?.withTag({
          src: currentChar,
          dst: currentChar,
          preset: `preset${presetIndex}` as Preset,
        })) ??
      null,
    [calc, currentChar, presetIndex]
  )

  return (
    <CalcContext.Provider value={calcWithTag}>{children}</CalcContext.Provider>
  )
}

function useCharacterAndEquipment(
  meta: ComboMetaDataum | undefined
): CharacterFullData | undefined {
  const character = useCharacter(meta?.characterKey)
  // TODO: Handle tc build
  const build = useBuild(meta?.buildId)
  const lightCone = useLightCone(build?.lightConeId)
  const relics = useEquippedRelics(build?.relicIds)
  return useMemo(
    () => ({
      character,
      lightCone,
      relics,
    }),
    [character, lightCone, relics]
  )
}

function createMember({
  character,
  lightCone,
  relics,
}: CharacterFullData): TagMapNodeEntries {
  if (!character) return []

  return withMember(
    character.key,
    ...charData(character),
    ...lightConeData(lightCone),
    ...relicsData(
      Object.values(relics)
        .filter((relic): relic is ICachedRelic => !!relic)
        .map((relic) => ({
          set: relic.setKey,
          stats: [
            ...relic.substats
              .filter(({ key }) => key !== '')
              .map((substat) => ({
                key: substat.key as RelicSubStatKey, // Safe because of the above filter
                value: substat.accurateValue,
              })),
            { key: relic.mainStatKey, value: relic.mainStatVal },
          ],
        }))
    )
  )
}
