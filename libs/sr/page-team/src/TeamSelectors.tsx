import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { TeamMetaDataum } from '@genshin-optimizer/sr/db'
import { useDatabaseContext, useTeam } from '@genshin-optimizer/sr/db-ui'
import { CharacterAutocomplete } from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function TeamSelectors({ teamId }: { teamId: string }) {
  const team = useTeam(teamId)!

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {team.teamMetadata.map((meta, index) => (
        <TeammateSelector
          key={`${index}_${meta?.characterKey}`}
          teamMetadataIndex={index}
          teamId={teamId}
        />
      ))}
    </Box>
  )
}

function TeammateSelector({
  teamMetadataIndex,
  teamId,
}: {
  teamMetadataIndex: number
  teamId: string
}) {
  const { database } = useDatabaseContext()
  const team = useTeam(teamId)!

  function setCharKey(cKey: CharacterKey | '') {
    // Remove teammate
    if (cKey === '') {
      database.teams.set(
        teamId,
        (team) => (team.teamMetadata[teamMetadataIndex] = undefined)
      )
      return
    }

    // Create char if needed
    database.chars.getOrCreate(cKey)

    // Check if character is already in the team.
    const existingIndex = team.teamMetadata.findIndex(
      (teamMetadatum) => teamMetadatum?.characterKey === cKey
    )
    // If not exists, insert it
    if (existingIndex === -1) {
      // If none, create it
      database.teams.set(teamId, (team) => {
        // Let the validator handle default properties for everything else
        team.teamMetadata[teamMetadataIndex] = {
          characterKey: cKey,
        } as TeamMetaDataum
      })
    }
    // If exists already, swap positions
    else {
      if (existingIndex === teamMetadataIndex) return
      const existingMeta = team.teamMetadata[existingIndex]
      const destMeta = team.teamMetadata[teamMetadataIndex]
      database.teams.set(teamId, (team) => {
        team.teamMetadata[teamMetadataIndex] = existingMeta
        team.teamMetadata[existingIndex] = destMeta
      })
    }
  }

  return (
    <CharacterAutocomplete
      charKey={team.teamMetadata[teamMetadataIndex]?.characterKey ?? ''}
      setCharKey={setCharKey}
    />
  )
}
