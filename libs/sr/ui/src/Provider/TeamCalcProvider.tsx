import type {
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import type {
  ICachedCharacter,
  ICachedLightCone,
  ICachedRelic,
  LoadoutMetadatum,
} from '@genshin-optimizer/sr/db'
import type {
  Member,
  SingleCondInfo,
  TagMapNodeEntries,
} from '@genshin-optimizer/sr/formula'
import {
  charData,
  conditionalData,
  enemyDebuff,
  lightConeData,
  members,
  relicsData,
  selfBuff,
  srCalculatorWithEntries,
  teamData,
  withMember,
} from '@genshin-optimizer/sr/formula'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import type { CalcContextObj } from '../Context/CalcContext'
import { CalcContext } from '../Context/CalcContext'
import { useCharacter, useEquippedRelics, useTeam } from '../Hook'
import { useLightCone } from '../Hook/useLightCone'

type CharacterFullData = {
  character: ICachedCharacter | undefined
  lightCone: ICachedLightCone | undefined
  relics: Record<RelicSlotKey, ICachedRelic | undefined>
  conditionals: SingleCondInfo | undefined // Assumes dst is the character
}

export function TeamCalcProvider({
  teamId,
  children,
}: {
  teamId: string
  children: ReactNode
}) {
  const team = useTeam(teamId)!
  const member0 = useCharacterAndEquipment(team.loadoutMetadata[0])
  const member1 = useCharacterAndEquipment(team.loadoutMetadata[1])
  const member2 = useCharacterAndEquipment(team.loadoutMetadata[2])
  const member3 = useCharacterAndEquipment(team.loadoutMetadata[3])

  const calcContextObj: CalcContextObj = useMemo(
    () => ({
      calc: srCalculatorWithEntries([
        // Specify members present in the team
        ...teamData(
          team.loadoutMetadata
            .map((meta, index) =>
              meta === undefined ? undefined : members[index]
            )
            .filter((m): m is Member => !!m)
        ),
        // Add actual member data
        ...(member0 ? createMember(0, member0) : []),
        ...(member1 ? createMember(1, member1) : []),
        ...(member2 ? createMember(2, member2) : []),
        ...(member3 ? createMember(3, member3) : []),
        // TODO: Get these from db
        enemyDebuff.common.lvl.add(80),
        enemyDebuff.common.res.add(0.1),
        enemyDebuff.common.isBroken.add(0),
        enemyDebuff.common.maxToughness.add(100),
        selfBuff.common.critMode.add('avg'),
      ]),
    }),
    [member0, member1, member2, member3, team.loadoutMetadata]
  )

  return (
    <CalcContext.Provider value={calcContextObj}>
      {children}
    </CalcContext.Provider>
  )
}

function useCharacterAndEquipment(
  loadoutMetadatum: LoadoutMetadatum | undefined
): CharacterFullData | undefined {
  const { database } = useDatabaseContext()
  const loadout = database.loadouts.get(loadoutMetadatum?.loadoutId)
  const character = useCharacter(loadout?.key)
  // TODO: Handle tc build
  const build = database.builds.get(loadoutMetadatum?.buildId)
  const lightCone = useLightCone(build?.lightConeId)
  const relics = useEquippedRelics(build?.relicIds)
  const conditionals = loadout?.conditional
  return { character, lightCone, relics, conditionals }
}

function createMember(
  memberIndex: 0 | 1 | 2 | 3,
  { character, lightCone, relics, conditionals }: CharacterFullData
): TagMapNodeEntries {
  return !character
    ? []
    : [
        ...withMember(
          `${memberIndex}`,
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
        ),
        ...conditionalData(`${memberIndex}`, conditionals),
      ]
}
