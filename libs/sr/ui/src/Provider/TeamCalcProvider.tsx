import { notEmpty } from '@genshin-optimizer/common/util'
import { constant } from '@genshin-optimizer/pando/engine'
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
  SrcCondInfo,
  Tag,
  TagMapNodeEntries,
} from '@genshin-optimizer/sr/formula'
import {
  charData,
  conditionalData,
  enemyDebuff,
  lightConeData,
  ownBuff,
  relicsData,
  srCalculatorWithEntries,
  teamData,
  withMember,
} from '@genshin-optimizer/sr/formula'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useDatabaseContext } from '../Context'
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
  bonusStats: Array<{ tag: Tag; value: number }>
}
/**
 * @deprecated move to page-team
 */
export function TeamCalcProvider({
  teamId,
  currentChar,
  children,
}: {
  teamId: string
  currentChar?: CharacterKey
  children: ReactNode
}) {
  const { database } = useDatabaseContext()
  const team = useTeam(teamId)!
  const member0 = useCharacterAndEquipment(team.loadoutMetadata[0])
  const member1 = useCharacterAndEquipment(team.loadoutMetadata[1])
  const member2 = useCharacterAndEquipment(team.loadoutMetadata[2])
  const member3 = useCharacterAndEquipment(team.loadoutMetadata[3])

  const calc = useMemo(
    () =>
      srCalculatorWithEntries([
        // Specify members present in the team
        ...teamData(
          team.loadoutMetadata
            .map(
              (meta) => database.loadouts.get(meta?.loadoutId)?.key ?? undefined
            )
            .filter(notEmpty)
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
      ]),
    [member0, member1, member2, member3, team.loadoutMetadata, database]
  )

  const calcWithTag = useMemo(
    () =>
      (currentChar && calc?.withTag({ src: currentChar, dst: currentChar })) ??
      null,
    [calc, currentChar]
  )

  return (
    <CalcContext.Provider value={calcWithTag}>{children}</CalcContext.Provider>
  )
}

function useCharacterAndEquipment(
  meta: LoadoutMetadatum | undefined
): CharacterFullData | undefined {
  const loadout = useLoadout(meta?.loadoutId)
  const character = useCharacter(loadout?.key)
  // TODO: Handle tc build
  const build = useBuild(meta?.buildId)
  const lightCone = useLightCone(build?.lightConeId)
  const relics = useEquippedRelics(build?.relicIds)

  // Convert dbConditionals {CharacterKey: condobject} to calcConditionals {Member: condObject}
  const conditionals = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(loadout?.conditional ?? {}).map(([srcKey, srcCond]) => [
          srcKey,
          srcCond,
        ])
      ),
    [loadout]
  )

  return useMemo(
    () => ({
      character,
      lightCone,
      relics,
      conditionals,
      bonusStats: loadout?.bonusStats ?? [],
    }),
    [character, lightCone, relics, conditionals, loadout]
  )
}

function createMember({
  character,
  lightCone,
  relics,
  conditionals,
  bonusStats,
}: CharacterFullData): TagMapNodeEntries {
  if (!character) return []
  const memberData = withMember(
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
    ),
    ...bonusStats.map(({ tag, value }) => ({
      tag: {
        ...tag,
      },
      value: constant(value),
    }))
  )

  return [...memberData, ...conditionalData(character.key, conditionals)]
}
