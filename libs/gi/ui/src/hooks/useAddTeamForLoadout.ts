import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAddTeamForLoadout() {
  const database = useDatabase()
  const navigate = useNavigate()
  return useCallback(
    (teamCharId: string) => {
      const teamId = database.teams.new()
      database.teams.set(teamId, (team) => {
        team.loadoutData[0] = { teamCharId } as LoadoutDatum
      })
      navigate(`/teams/${teamId}`)
    },
    [database, navigate]
  )
}
