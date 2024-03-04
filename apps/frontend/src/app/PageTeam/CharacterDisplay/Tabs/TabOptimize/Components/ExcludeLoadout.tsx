import { useDatabase, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useContext, useEffect } from 'react'
import { TeamCharacterContext } from '../../../../../Context/TeamCharacterContext'

export default function ExcludeLoadout({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const database = useDatabase()
  const {
    teamCharId,
    teamChar: { optConfigId },
    team,
  } = useContext(TeamCharacterContext)
  const { useLoadoutExclusion } = useOptConfig(optConfigId)!

  useEffect(() => {
    const artifactIds = Array.from(
      new Set(
        team.teamCharIds
          .filter((id) => id !== teamCharId)
          .map((id) => database.teamChars.getLoadoutArtifacts(id))
          .flatMap((artSet) => Object.values(artSet))
          .filter((id) => !!id)
          .map(({ id }) => id)
      )
    )
    database.optConfigs.set(optConfigId, { loadoutExclusion: artifactIds })
  }, [
    database.optConfigs,
    database.teamChars,
    optConfigId,
    team.teamCharIds,
    teamCharId,
  ])

  return (
    <Button
      fullWidth
      startIcon={useLoadoutExclusion ? <CheckBox /> : <CheckBoxOutlineBlank />}
      color={useLoadoutExclusion ? 'success' : 'secondary'}
      onClick={() => {
        database.optConfigs.set(optConfigId, {
          useLoadoutExclusion: !useLoadoutExclusion,
        })
      }}
      disabled={disabled}
    >
      {/* TODO: Translation */}
      Use artifacts in teammates' builds
    </Button>
  )
}
