import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import type {
  CharacterKey,
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
  SrcCondInfo,
  TagMapNodeEntries,
} from '@genshin-optimizer/sr/formula'
import {
  charData,
  conditionalData,
  enemyDebuff,
  lightConeData,
  members,
  relicsData,
  ownBuff,
  srCalculatorWithEntries,
  teamData,
  withMember,
} from '@genshin-optimizer/sr/formula'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import {
  useBuild,
  useCharacter,
  useEquippedRelics,
  useLoadout,
  useTeam,
} from '../Hook'
import { useLightCone } from '../Hook/useLightCone'

type CharacterFullData = {
  character: ICachedCharacter | undefined
  lightCone: ICachedLightCone | undefined
  relics: Record<RelicSlotKey, ICachedRelic | undefined>
  conditionals: SrcCondInfo | undefined // Assumes dst is the character
}
type MemberIndexMap = Partial<Record<CharacterKey | 'all', Member | 'all'>>

export function TeamCalcProvider({
  teamId,
  children,
}: {
  teamId: string
  children: ReactNode
}) {
  const team = useTeam(teamId)!
  const loadout0 = useLoadout(team.loadoutMetadata[0]?.loadoutId)
  const loadout1 = useLoadout(team.loadoutMetadata[1]?.loadoutId)
  const loadout2 = useLoadout(team.loadoutMetadata[2]?.loadoutId)
  const loadout3 = useLoadout(team.loadoutMetadata[3]?.loadoutId)
  const memberIndexMap: MemberIndexMap = { all: 'all' }
  if (loadout0) memberIndexMap[loadout0.key] = '0'
  if (loadout1) memberIndexMap[loadout1.key] = '1'
  if (loadout2) memberIndexMap[loadout2.key] = '2'
  if (loadout3) memberIndexMap[loadout3.key] = '3'
  const member0 = useCharacterAndEquipment(
    team.loadoutMetadata[0],
    memberIndexMap
  )
  const member1 = useCharacterAndEquipment(
    team.loadoutMetadata[1],
    memberIndexMap
  )
  const member2 = useCharacterAndEquipment(
    team.loadoutMetadata[2],
    memberIndexMap
  )
  const member3 = useCharacterAndEquipment(
    team.loadoutMetadata[3],
    memberIndexMap
  )

  const calc = useMemo(
    () =>
      srCalculatorWithEntries([
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
        ownBuff.common.critMode.add('avg'),
      ]),
    [member0, member1, member2, member3, team.loadoutMetadata]
  )

  return <CalcContext.Provider value={calc}>{children}</CalcContext.Provider>
}

function useCharacterAndEquipment(
  meta: LoadoutMetadatum | undefined,
  memberIndexMap: MemberIndexMap
): CharacterFullData | undefined {
  const loadout = useLoadout(meta?.loadoutId)
  const character = useCharacter(loadout?.key)
  // TODO: Handle tc build
  const build = useBuild(meta?.buildId)
  const lightCone = useLightCone(build?.lightConeId)
  const relics = useEquippedRelics(build?.relicIds)

  // Convert dbConditionals {CharacterKey: condobject} to calcConditionals {Member: condObject}
  const dbConditionals = loadout?.conditional
  const conditionals = Object.fromEntries(
    Object.entries(dbConditionals ?? {}).map(([srcKey, srcCond]) => [
      memberIndexMap[srcKey],
      srcCond,
    ])
  )

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
