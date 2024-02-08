import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  TextField,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import { DatabaseContext } from '../Database/Database'
import CloseButton from '../Components/CloseButton'
export default function TeamSettingBtn({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false)
  const { database } = useContext(DatabaseContext)
  const team = database.teams.get(teamId)

  const [name, setName] = useState(team.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(team.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on teamId change, to use the new team's name/desc
  useEffect(() => {
    const { name, description } = database.teams.get(teamId)
    setName(name)
    setDesc(description)
  }, [database, teamId])

  useEffect(() => {
    database.teams.set(teamId, (team) => {
      team.name = nameDeferred
    })
    // Don't need to trigger when teamId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, nameDeferred])

  useEffect(() => {
    database.teams.set(teamId, (team) => {
      team.description = descDeferred
    })
    // Don't need to trigger when teamId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, descDeferred])
  return (
    <>
      <Button
        color="info"
        onClick={() => setOpen((open) => !open)}
        sx={{ p: 1, minWidth: 0 }}
      >
        <SettingsIcon />
      </Button>
      <ModalWrapper open={open} onClose={() => setOpen(false)}>
        <CardThemed>
          <CardHeader
            title="Team Settings"
            action={<CloseButton onClick={() => setOpen(false)} />}
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <TextField
              fullWidth
              label="Team Name"
              placeholder="Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Team Description"
              placeholder="Team Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              multiline
              rows={4}
            />
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
