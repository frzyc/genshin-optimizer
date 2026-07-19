import { useMemo } from 'react'
import { useDatabase } from './useDatabase'

export function useSrcTeamCharName(srcTeamCharId?: string) {
  const database = useDatabase()
  return useMemo(() => {
    if (!srcTeamCharId) return undefined
    return database.teamChars.get(srcTeamCharId)?.name
  }, [database, srcTeamCharId])
}
