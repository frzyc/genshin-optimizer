import { constant } from '@genshin-optimizer/pando/engine'
import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import type {
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import type {
  ICachedCharacter,
  ICachedLightCone,
  ICachedRelic,
  TeammateDatum,
} from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useCharacter,
  useLightCone,
  useRelics,
  useTeam,
} from '@genshin-optimizer/sr/db-ui'
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
import type { ReactNode } from 'react'
import { useMemo } from 'react'

type CharacterFullData = {
  character: ICachedCharacter | undefined
  lightCone: ICachedLightCone | undefined
  relics: Record<RelicSlotKey, ICachedRelic | undefined>
}

export function TeamCalcProvider({
  teamId,
  children,
}: {
  teamId: string
  children: ReactNode
}) {
  const team = useTeam(teamId)!
  const member0 = useCharacterAndEquipment(team.teamMetadata[0])
  const member1 = useCharacterAndEquipment(team.teamMetadata[1])
  const member2 = useCharacterAndEquipment(team.teamMetadata[2])
  const member3 = useCharacterAndEquipment(team.teamMetadata[3])

  const calc = useMemo(
    () =>
      srCalculatorWithEntries([
        // Specify members present in the team
        ...teamData(
          team.teamMetadata
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
        ...team.conditionals.flatMap(
          ({ sheet, src, dst, condKey, condValues }) =>
            condValues.flatMap((condValue, frameIndex) =>
              condValue
                ? withPreset(
                    `preset${frameIndex}` as Preset,
                    conditionalEntries(sheet, src, dst)(condKey, condValue)
                  )
                : []
            )
        ),
        ...team.bonusStats.flatMap(({ tag, values }) =>
          values.flatMap((value, frameIndex) =>
            withPreset(`preset${frameIndex}` as Preset, {
              tag: { ...tag },
              value: constant(value),
            })
          )
        ),
      ]),
    [team, member0, member1, member2, member3]
  )

  return <CalcContext.Provider value={calc}>{children}</CalcContext.Provider>
}

function useCharacterAndEquipment(
  meta: TeammateDatum | undefined
): CharacterFullData | undefined {
  const character = useCharacter(meta?.characterKey)
  // TODO: Handle tc build
  // TODO: Handle equipped build
  const build = useBuild(meta?.buildId)
  const lightCone = useLightCone(build?.lightConeId)
  const relics = useRelics(build?.relicIds ?? character?.equippedRelics) // TODO: Temporary for testing
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
