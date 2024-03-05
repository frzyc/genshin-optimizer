import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import PersonIcon from '@mui/icons-material/Person'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import CloseButton from '../../Components/CloseButton'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
import { LoadoutDropdown } from '../LoadoutDropdown'
// TODO: Translation

export default function LoadoutSettingElement() {
  const { teamId, teamCharId } = useContext(TeamCharacterContext)

  const database = useDatabase()
  const teamChar = database.teamChars.get(teamCharId)!
  const [open, setOpen] = useState(false)

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

  const onChangeTeamCharId = (newTeamCharId: string) => {
    const index = database.teams
      .get(teamId)!
      .teamCharIds.findIndex((id) => id === teamCharId)
    if (index < 0) return
    database.teams.set(teamId, (team) => {
      team.teamCharIds[index] = newTeamCharId
    })
  }
  return (
    <>
      <Box display="flex" gap={1} alignItems="center">
        <BootstrapTooltip
          title={<Typography>{teamChar.description}</Typography>}
        >
          <Button
            startIcon={<PersonIcon />}
            endIcon={<DriveFileRenameOutlineIcon />}
            color="info"
            onClick={() => setOpen((o) => !o)}
          >
            <Typography variant="h6">{teamChar.name}</Typography>
          </Button>
        </BootstrapTooltip>
      </Box>

      <ModalWrapper open={open} onClose={() => setOpen(false)}>
        <CardThemed>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon />
                <span>Loadout Settings</span>
              </Box>
            }
            action={<CloseButton onClick={() => setOpen(false)} />}
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Alert variant="filled" severity="info">
              <strong>Loadouts</strong> provides character context data,
              including bonus stats, conditionals, multi-tagets, optimization
              config, and stores builds. A single <strong>Loadout</strong> can
              be used for many teams.
            </Alert>
            <LoadoutDropdown
              teamCharId={teamCharId}
              onChangeTeamCharId={onChangeTeamCharId}
              dropdownBtnProps={{ fullWidth: true }}
            />
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
              placeholder="Loadout Description"
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
