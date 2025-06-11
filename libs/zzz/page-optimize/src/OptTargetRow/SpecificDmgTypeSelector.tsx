import type { SpecificDmgTypeKey } from '@genshin-optimizer/zzz/db'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { useCallback } from 'react'
import { DmgTypeDropdown } from '../DmgTypeDropdown'

export function SpecificDmgTypeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { target } = charOpt
  const setDmgType = useCallback(
    (dmgType?: SpecificDmgTypeKey) =>
      database.charOpts.set(character.key, ({ target: oldTarget = {} }) => {
        const { damageType1, ...oTarget } = oldTarget
        if (!dmgType) return { target: oTarget }
        return {
          target: { ...oTarget, damageType1: dmgType },
        }
      }),
    [database, character.key]
  )
  if (target?.name !== 'standardDmgInst' && target?.name !== 'sheerDmgInst')
    return null
  return (
    <DmgTypeDropdown
      dmgType={target?.damageType1 as SpecificDmgTypeKey}
      keys={specificDmgTypeKeys}
      setDmgType={setDmgType}
    />
  )
}
