import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import type { TeamData, dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  DataContext,
  StatDisplayComponent,
  getTeamDataCalc,
} from '@genshin-optimizer/gi/ui'
import { Box, Grid } from '@mui/material'
import { useMemo } from 'react'
import { OptCharacterCard } from '../CharacterDisplay/Tabs/TabOptimize/Components/OptCharacterCard'

export default function TeamOptimize({ teamId }: { teamId: string }) {
  // First, neeed to display short info about the team
  // Character icons, their weapons, artifacts, and several multi-targets
  // Then, display the optimization options
  const database = useDatabase()
  const { gender } = useDBMeta()

  const teamData = useMemo(
    () => getFullTeamData(database, gender, teamId),
    [database, gender, teamId]
  )
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
      <OptTeamCard teamId={teamId} teamData={teamData} />
    </Box>
  )
}

function getFullTeamData(
  database: ReturnType<typeof useDatabase>,
  gender: ReturnType<typeof useDBMeta>['gender'],
  teamId: string
) {
  const { loadoutData } = database.teams.get(teamId)!
  const teamData: ReturnType<typeof getTeamDataCalc> = {}
  for (const loadoutDatum of loadoutData) {
    if (!loadoutDatum) continue
    const characterKey = database.teamChars.get(loadoutDatum.teamCharId)?.key
    if (!characterKey) continue
    const charTeamData = getTeamDataCalc(
      database,
      teamId,
      gender,
      loadoutDatum.teamCharId
    )
    if (!charTeamData) continue
    teamData[characterKey] = charTeamData[characterKey]
  }
  return teamData
}

function OptTeamCard({
  teamId,
  teamData,
}: {
  teamId: string
  teamData: TeamData
}) {
  const team = useTeam(teamId)!
  const loadoutData = team.loadoutData

  return (
    <Grid container columns={{ xs: 1, md: 2, lg: 4 }} spacing={2}>
      {loadoutData.map((loadoutDatum, ind) => (
        <Grid item xs={1} key={loadoutDatum?.teamCharId ?? ind}>
          {loadoutDatum ? (
            <TeammateMiniDisplay
              loadoutDatum={loadoutDatum}
              teamData={teamData}
            />
          ) : null}
        </Grid>
      ))}
    </Grid>
  )
}

function TeammateMiniDisplay({
  loadoutDatum,
  teamData,
}: {
  loadoutDatum: LoadoutDatum
  teamData: TeamData
}) {
  const database = useDatabase()
  const { teamCharId } = loadoutDatum
  const characterKey = database.teamChars.get(teamCharId)?.key
  const { target: charUIData } =
    (characterKey && teamData?.[characterKey]) ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])
  if (!dataContextValue || !characterKey) return null
  return (
    <DataContext.Provider value={dataContextValue}>
      <OptCharacterCard characterKey={characterKey} hideStats />
      <StatDisplayComponent
        sections={['custom']}
        columns={{ md: 1 }}
        hideHeaders
      />
    </DataContext.Provider>
  )
}
