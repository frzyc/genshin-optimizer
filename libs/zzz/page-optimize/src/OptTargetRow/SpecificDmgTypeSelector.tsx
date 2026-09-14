import type { SpecificDmgTypeKey } from '@genshin-optimizer/zzz/db'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { withDamageType1 } from '@genshin-optimizer/zzz/formula'
import { useResolvedOptTarget } from '@genshin-optimizer/zzz/formula-ui'
import { useCallback } from 'react'
import { DmgTypeDropdown } from '../DmgTypeDropdown'

export function SpecificDmgTypeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const { ref, entry } = useResolvedOptTarget()
  const setDmgType = useCallback(
    (dmgType?: SpecificDmgTypeKey) =>
      database.teams.setFrame0(character.key, (frame) => {
        if (!frame.ref) return false
        const next = withDamageType1(frame.ref, dmgType)
        return next ? { ref: next } : false
      }),
    [database.teams, character.key]
  )
  if (!entry?.overlays?.damageType1 || !ref) return null
  return (
    <DmgTypeDropdown
      dmgType={ref.damageType1}
      keys={specificDmgTypeKeys}
      setDmgType={setDmgType}
    />
  )
}
