import { constant } from '@genshin-optimizer/pando/engine'
import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import type { RelicSubStatKey } from '@genshin-optimizer/sr/consts'
import type { ICachedRelic, TeammateDatum } from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useCharacter,
  useLightCone,
  useRelics,
  useTeam,
} from '@genshin-optimizer/sr/db-ui'
import type { Member, Preset } from '@genshin-optimizer/sr/formula'
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
        ...member0,
        ...member1,
        ...member2,
        ...member3,
        // TODO: Get enemy values from db
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

function useCharacterAndEquipment(meta: TeammateDatum | undefined) {
  const character = useCharacter(meta?.characterKey)
  // TODO: Handle tc build
  const build = useBuild(meta?.buildId)
  const lightCone = useLightCone(
    meta?.buildType === 'equipped'
      ? character?.equippedLightCone
      : meta?.buildType === 'real'
      ? build?.lightConeId
      : undefined
  )
  const relics = useRelics(
    meta?.buildType === 'equipped'
      ? character?.equippedRelics
      : meta?.buildType === 'real'
      ? build?.relicIds
      : undefined
  )
  return useMemo(() => {
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
  }, [character, lightCone, relics])
}
