import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../Database/Database'
import type { Team } from '../Database/DataManagers/TeamDataManager'

export default function useTeam(teamId: string): Team {
  const { database } = useContext(DatabaseContext)
  const [team, setTeam] = useState(() => database.teams.get(teamId))
  useEffect(() => {
    setTeam(database.teams.get(teamId))
    return database.teams.follow(
      teamId,
      (k, r, v) => r === 'update' && setTeam(v)
    )
  }, [teamId, setTeam, database])
  return team
}
