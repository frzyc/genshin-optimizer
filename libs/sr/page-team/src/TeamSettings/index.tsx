import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { LoadoutMetadatum } from '@genshin-optimizer/sr/db'
import {
  CharacterAutocomplete,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import { Box } from '@mui/material'

export default function TeamSettings({ teamId }: { teamId: string }) {
  const { database } = useDatabaseContext()
  const team = database.teams.get(teamId)!
  return (
    <Box>
      {teamId}
      {team.loadoutMetadata.map((meta, index) => (
        <TeammateSelector
          key={`${index}_${meta?.loadoutId}`}
          loadoutMetadataIndex={index}
          teamId={teamId}
        />
      ))}
    </Box>
  )
}

function TeammateSelector({
  loadoutMetadataIndex,
  teamId,
}: {
  loadoutMetadataIndex: number
  teamId: string
}) {
  const { database } = useDatabaseContext()
  const team = database.teams.get(teamId)!
  const loadoutId = team.loadoutMetadata[loadoutMetadataIndex]?.loadoutId
  const loadout = database.loadouts.get(loadoutId)

  function setCharKey(cKey: CharacterKey | '') {
    // Remove teammate
    if (cKey === '') {
      database.teams.set(
        teamId,
        (team) => (team.loadoutMetadata[loadoutMetadataIndex] = undefined)
      )
      return
    }

    // Create char if needed
    database.chars.getOrCreate(cKey)

    // Check if character is already in the team.
    const existingIndex = team.loadoutMetadata.findIndex(
      (loadoutMetadatum) =>
        loadoutMetadatum &&
        database.loadouts.get(loadoutMetadatum.loadoutId)?.key === cKey
    )
    // If not exists, insert it
    if (existingIndex === -1) {
      // Grab first loadout
      let loadoutId = database.loadouts.keys.find(
        (k) => database.loadouts.get(k)!.key === cKey
      )
      // If none, create it
      if (!loadoutId) loadoutId = database.loadouts.new(cKey)
      database.teams.set(teamId, (team) => {
        // Let the validator handle default properties for everything else
        team.loadoutMetadata[loadoutMetadataIndex] = {
          loadoutId,
        } as LoadoutMetadatum
      })
    }
    // If exists already, swap positions
    else {
      if (existingIndex === loadoutMetadataIndex) return
      const existingMeta = team.loadoutMetadata[existingIndex]
      const destMeta = team.loadoutMetadata[loadoutMetadataIndex]
      database.teams.set(teamId, (team) => {
        team.loadoutMetadata[loadoutMetadataIndex] = existingMeta
        team.loadoutMetadata[existingIndex] = destMeta
      })
    }
  }

  return (
    <CharacterAutocomplete
      charKey={loadout?.key ?? ''}
      setCharKey={setCharKey}
    />
  )
}
