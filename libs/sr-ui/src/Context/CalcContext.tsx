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
import { useLightCone } from '../Hook/useLightCone'
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
  const lightCone = useLightCone(character?.equippedLightCone)
  const calcContextObj: CalcContextObj = useMemo(
    () => ({
      calc:
        character &&
        srCalculatorWithEntries([
          ...teamData(['member0'], ['member0']),
          ...withMember(
            'member0',
            ...charData(character),
            ...lightConeData(lightCone),
            ...relicsData([])
          ),
          enemyDebuff.common.lvl.add(80),
          enemyDebuff.common.preRes.add(0.1),
          selfBuff.common.critMode.add('avg'),
        ]),
    }),
    [character, lightCone]
  )

  return (
    <CalcContext.Provider value={calcContextObj}>
      {children}
    </CalcContext.Provider>
  )
}
