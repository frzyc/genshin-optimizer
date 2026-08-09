import { getTeamFrame0, targetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import { useMemo } from 'react'

/** Persisted team frame-0 opt target and its resolved formula tag. */
export function useResolvedOptTarget() {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const optTarget = team ? getTeamFrame0(team).tag : undefined
  const resolvedOptTag = useMemo(
    () => (optTarget ? targetTag(optTarget) : undefined),
    [optTarget]
  )
  return { optTarget, resolvedOptTag }
}
