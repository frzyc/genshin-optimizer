import { notEmpty } from '@genshin-optimizer/common/util'
import type { Preset } from '@genshin-optimizer/game-opt/engine'
import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import { constant } from '@genshin-optimizer/pando/engine'
import type { TeammateDatum } from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useBuildTc,
  useCharacter,
  useLightCone,
  useRelics,
  useTeam,
} from '@genshin-optimizer/sr/db-ui'
import type { Member } from '@genshin-optimizer/sr/formula'
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
import {
  relicsTagMapNodes,
  relicTcTagMapNodes,
} from '@genshin-optimizer/sr/solver'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
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
            .map((meta) => meta?.characterKey)
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
  const buildTc = useBuildTc(meta?.buildTcId)
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
  const lcTagEntries = useMemo(() => {
    const lc =
      meta?.buildType === 'tc' ? (buildTc?.lightCone as ILightCone) : lightCone
    if (!lc) return []
    return lightConeTagMapNodeEntries(
      lc.key,
      lc.level,
      lc.ascension,
      lc.superimpose
    )
  }, [meta?.buildType, buildTc?.lightCone, lightCone])
  const relicTagEntries = useMemo(() => {
    const tcrelic = buildTc?.relic
    if (meta?.buildType === 'tc' && tcrelic) return relicTcTagMapNodes(tcrelic)
    if (!relics) return []
    return relicsTagMapNodes(Object.values(relics).filter(notEmpty))
  }, [buildTc?.relic, meta?.buildType, relics])
  return useMemo(() => {
    if (!character) return []
    return withMember(
      character.key,
      ...charTagMapNodeEntries(character),
      ...lcTagEntries,
      ...relicTagEntries
    )
  }, [character, lcTagEntries, relicTagEntries])
}
