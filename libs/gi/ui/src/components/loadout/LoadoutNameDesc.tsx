import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { TextField } from '@mui/material'
import { useDeferredValue, useEffect, useState } from 'react'

// TODO: Translation

export function LoadoutNameDesc({ teamCharId }: { teamCharId: string }) {
  const database = useDatabase()
  const teamChar = database.teamChars.get(teamCharId)!
  const [name, setName] = useState(teamChar.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(teamChar.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on teamCharId change, to use the new team's name/desc
  useEffect(() => {
    const newTeamChar = database.teamChars.get(teamCharId)
    if (!newTeamChar) return
    const { name, description } = newTeamChar
    setName(name)
    setDesc(description)
  }, [database, teamCharId])

  useEffect(() => {
    database.teamChars.set(teamCharId, (teamChar) => {
      teamChar.name = nameDeferred
    })
    // Don't need to trigger when teamCharId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, nameDeferred])

  useEffect(() => {
    database.teamChars.set(teamCharId, (teamChar) => {
      teamChar.description = descDeferred
    })
    // Don't need to trigger when teamCharId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, descDeferred])
  return (
    <>
      <TextField
        fullWidth
        label="Loadout Name"
        placeholder="Loadout Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        fullWidth
        label="Loadout Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        multiline
        minRows={2}
      />
    </>
  )
}
