import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import { CompareCalcContext } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  CharacterContext,
  useRequiredPandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import {
  EquipBuildModalLayout,
  type EquipBuildModalProps,
} from '@genshin-optimizer/gi/ui'
import { useContext } from 'react'
import { useRequiredGiCalcContext } from '../hooks'
import { CharCalcProvider } from './CharCalcProvider'
import { CharStatsDisplay } from './CharStatsDisplay'

export function PandoEquipBuildModal(props: EquipBuildModalProps) {
  const { character } = useContext(CharacterContext)
  const pandoTeam = useRequiredPandoTeam()
  const baseCalc = useRequiredGiCalcContext()

  return (
    <EquipBuildModalLayout {...props}>
      {props.show ? (
        <CharCalcProvider
          character={character}
          pandoTeam={pandoTeam}
          equippedWeapon={props.newWeaponId ?? character.equippedWeapon}
          equippedArtifacts={props.newArtifactIds}
        >
          <CompareCalcContext.Provider value={baseCalc as Calculator}>
            <CharStatsDisplay characterKey={character.key} />
          </CompareCalcContext.Provider>
        </CharCalcProvider>
      ) : null}
    </EquipBuildModalLayout>
  )
}
