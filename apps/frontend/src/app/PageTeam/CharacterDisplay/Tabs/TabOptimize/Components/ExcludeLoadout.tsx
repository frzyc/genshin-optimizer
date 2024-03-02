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
  const { useLoadoutExclusion } = useOptConfig(optConfigId)

  useEffect(() => {
    console.log('Update ExcludeLoadout')
    const chars = team.teamCharIds
      .filter((id) => id !== teamCharId)
      .map((id) => database.teamChars.get(id))
    const buildIds = chars.map((char) => char.buildIds).flat()
    const builds = buildIds.map((id) => database.builds.get(id))
    const artifactIds = Array.from(
      new Set(
        builds
          .map((build) => build.artifactIds)
          .map(Object.values)
          .flat()
          .filter((val) => !!val)
      )
    ) as string[]
    database.optConfigs.set(optConfigId, { loadoutExclusion: artifactIds })
  }, [database, optConfigId, team.teamCharIds, teamCharId])

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
      Use Teammates Loadouts
    </Button>
  )
}
