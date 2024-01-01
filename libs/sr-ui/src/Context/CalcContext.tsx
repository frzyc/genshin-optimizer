import type { Calculator } from '@genshin-optimizer/sr-formula'
import {
  charData,
  srCalculatorWithEntries,
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
          ...withMember('member0', ...charData(character)),
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
