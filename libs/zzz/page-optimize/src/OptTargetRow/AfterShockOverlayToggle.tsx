import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { withDamageType2 } from '@genshin-optimizer/zzz/formula'
import { useResolvedOptTarget } from '@genshin-optimizer/zzz/formula-ui'
import { useCallback } from 'react'
import { AfterShockToggleButton } from '../AfterShockToggleButton'

export function AfterShockOverlayToggle() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const { ref, entry } = useResolvedOptTarget()
  const setAfterShock = useCallback(
    (aftershock: boolean) =>
      database.teams.setFrame0(character.key, (frame) => {
        if (!frame.ref) return false
        const next = withDamageType2(frame.ref, aftershock)
        return next ? { ref: next } : false
      }),
    [database, character.key]
  )
  if (!entry?.overlays?.damageType2 || !ref) return null
  return (
    <AfterShockToggleButton
      isAftershock={ref.damageType2 === 'aftershock'}
      setAftershock={setAfterShock}
    />
  )
}
