import type { Calculator } from '@genshin-optimizer/sr-formula'
import {
  charData,
  enemyDebuff,
  lightConeData,
  relicsData,
  selfBuff,
  srCalculatorWithEntries,
  teamData,
  withMember,
} from '@genshin-optimizer/sr-formula'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { useCharacter } from '../Hook'
import { useCharacterContext } from './CharacterContext'
type CalcContextObj = {
  calc: Calculator | undefined
}

const CalcContext = createContext({} as CalcContextObj)

export function useCalcContext() {
  return useContext(CalcContext)
}

export function CalcProvider({ children }: { children: ReactNode }) {
  const { characterKey } = useCharacterContext()
  const character = useCharacter(characterKey)
  const calcContextObj: CalcContextObj = useMemo(
    () => ({
      calc:
        character &&
        srCalculatorWithEntries([
          ...teamData(['member0'], ['member0']),
          ...withMember(
            'member0',
            ...charData(character),
            ...lightConeData({
              key: 'TrendOfTheUniversalMarket',
              ascension: 1,
              level: 20,
              superimpose: 1,
              location: 'March7th',
              lock: false,
            }),
            ...relicsData([])
          ),
          enemyDebuff.common.lvl.add(80),
          enemyDebuff.common.preRes.add(0.1),
          selfBuff.common.critMode.add('avg'),
        ]),
    }),
    [character]
  )

  return (
    <CalcContext.Provider value={calcContextObj}>
      {children}
    </CalcContext.Provider>
  )
}
