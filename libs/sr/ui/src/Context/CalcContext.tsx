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
import type {
  Calculator,
  Member,
  TagMapNodeEntries,
} from '@genshin-optimizer/sr/formula'
import {
  charData,
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
import { createContext, useContext, useMemo } from 'react'
import { useCharacter, useEquippedRelics } from '../Hook'
import { useLightCone } from '../Hook/useLightCone'
import { useCharacterContext } from './CharacterContext'

type CalcContextObj = {
  calc: Calculator | undefined
}

type CharacterFullData = {
  character: ICachedSroCharacter | undefined
  lightCone: ICachedLightCone | undefined
  relics: Record<RelicSlotKey, ICachedRelic | undefined>
}

const CalcContext = createContext({} as CalcContextObj)

export function useCalcContext() {
  return useContext(CalcContext)
}

export function CalcProvider({ children }: { children: ReactNode }) {
  const { characterKey } = useCharacterContext()
  const mainChar = useCharacterAndEquipment(characterKey)

  const teammate1 = useCharacterAndEquipment(mainChar.character?.team[0])
  const teammate2 = useCharacterAndEquipment(mainChar.character?.team[1])
  const teammate3 = useCharacterAndEquipment(mainChar.character?.team[2])

  const calcContextObj: CalcContextObj = useMemo(
    () => ({
      calc:
        mainChar.character &&
        srCalculatorWithEntries([
          ...teamData([
            members[0],
            ...mainChar.character.team
              .map((key, index) =>
                key === '' ? undefined : members[index + 1]
              )
              .filter((m): m is Member => !!m),
          ]),
          ...createMember(0, mainChar),
          ...createMember(1, teammate1),
          ...createMember(2, teammate2),
          ...createMember(3, teammate3),
          // TODO: Get these from db
          enemyDebuff.common.lvl.add(80),
          enemyDebuff.common.res.add(0.1),
          selfBuff.common.critMode.add('avg'),
        ]),
    }),
    [mainChar, teammate1, teammate2, teammate3]
  )

  return (
    <CalcContext.Provider value={calcContextObj}>
      {children}
    </CalcContext.Provider>
  )
}

function useCharacterAndEquipment(
  characterKey: CharacterKey | '' | undefined
): CharacterFullData {
  const character = useCharacter(characterKey)
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
    : withMember(
        `member${memberIndex}`,
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
        // TODO: Conditionals
      )
}
