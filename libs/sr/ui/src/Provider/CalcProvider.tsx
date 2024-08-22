import type {
  CharacterKey,
  RelicSlotKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import type {
  ICachedLightCone,
  ICachedRelic,
  ICachedSroCharacter,
} from '@genshin-optimizer/sr/db'
import type { Member, TagMapNodeEntries } from '@genshin-optimizer/sr/formula'
import {
  charData,
  conditionalData,
  enemy,
  lightConeData,
  members,
  relicsData,
  self,
  srCalculatorWithEntries,
  teamData,
  withMember,
} from '@genshin-optimizer/sr/formula'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { CalcContextObj } from '../Context/CalcContext'
import { CalcContext } from '../Context/CalcContext'
import { useCharacterContext } from '../Context/CharacterContext'
import { useCharacter, useEquippedRelics } from '../Hook'
import { useLightCone } from '../Hook/useLightCone'

type CharacterFullData = {
  character: ICachedSroCharacter | undefined
  lightCone: ICachedLightCone | undefined
  relics: Record<RelicSlotKey, ICachedRelic | undefined>
}

export function CalcProvider({ children }: { children: ReactNode }) {
  const { character } = useCharacterContext()
  const mainChar = useCharacterAndEquipment(character)

  const character1 = useCharacter(mainChar.character?.team[0])
  const character2 = useCharacter(mainChar.character?.team[1])
  const character3 = useCharacter(mainChar.character?.team[2])
  const member1 = useCharacterAndEquipment(character1)
  const member2 = useCharacterAndEquipment(character2)
  const member3 = useCharacterAndEquipment(character3)

  const calcContextObj: CalcContextObj = useMemo(
    () => ({
      calc:
        mainChar.character &&
        srCalculatorWithEntries([
          ...teamData([
            members[1],
            ...mainChar.character.team
              .map((key, index) =>
                key === '' ? undefined : members[index + 2]
              )
              .filter((m): m is Member => !!m),
          ]),
          ...createMember(0, mainChar),
          ...createMember(1, member1),
          ...createMember(2, member2),
          ...createMember(3, member3),
          // TODO: Get these from db
          enemy.common.lvl.add(80),
          enemy.common.res.add(0.1),
          enemy.common.isBroken.add(0),
          enemy.common.maxToughness.add(100),
          self.common.critMode.add('avg'),
        ]),
    }),
    [mainChar, member1, member2, member3]
  )

  return (
    <CalcContext.Provider value={calcContextObj}>
      {children}
    </CalcContext.Provider>
  )
}

function useCharacterAndEquipment(
  character: ICachedSroCharacter | undefined
): CharacterFullData {
  const lightCone = useLightCone(character?.equippedLightCone)
  const relics = useEquippedRelics(character?.equippedRelics)
  return { character, lightCone, relics }
}

function createMember(
  memberIndex: 0 | 1 | 2 | 3,
  { character, lightCone, relics }: CharacterFullData
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
        // TODO: Conditionals
        ...conditionalData('0', {
          // Only 1 Ruan Mei on a team, so src doesn't matter
          all: {
            RuanMei: {
              skillOvertone: 1,
              ultZone: 1,
              e4Broken: 1,
            },
          },
        }),
      ]
}
