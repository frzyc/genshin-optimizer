import type { RelicSubStatKey } from '@genshin-optimizer/sr-consts'
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
import { useCharacter, useEquippedRelics } from '../Hook'
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
  const relics = useEquippedRelics(character?.equippedRelics)
  const calcContextObj: CalcContextObj = useMemo(
    () => ({
      calc:
        character &&
        srCalculatorWithEntries([
          ...teamData(['member0']),
          ...withMember(
            'member0',
            ...charData(character),
            ...lightConeData(lightCone),
            ...relicsData(
              Object.values(relics).map((relic) => ({
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
          enemyDebuff.common.lvl.add(80),
          enemyDebuff.common.res.add(0.1),
          selfBuff.common.critMode.add('avg'),
        ]),
    }),
    [character, lightCone, relics]
  )

  return (
    <CalcContext.Provider value={calcContextObj}>
      {children}
    </CalcContext.Provider>
  )
}
