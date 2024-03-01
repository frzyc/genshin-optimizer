import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { Suspense, useDeferredValue, useEffect, useState } from 'react'
import CharacterSelectionModal from '../Components/Character/CharacterSelectionModal'
import CloseButton from '../Components/CloseButton'
import CharIconSide from '../Components/Image/CharIconSide'

// TODO: Translation

export default function TeamSettingElement({ teamId }: { teamId: string }) {
  const database = useDatabase()
  const team = database.teams.get(teamId)!
  const noChars = team.teamCharIds.every((id) => !id)
  // open the settings modal by default
  const [open, setOpen] = useState(noChars ? true : false)

  const [name, setName] = useState(team.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(team.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on teamId change, to use the new team's name/desc
  useEffect(() => {
    const newTeam = database.teams.get(teamId)
    if (!newTeam) return
    const { name, description } = newTeam
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
      <Box display="flex" gap={1} alignItems="center">
        <BootstrapTooltip title={<Typography>{team.description}</Typography>}>
          <Button
            endIcon={<DriveFileRenameOutlineIcon />}
            onClick={() => setOpen((open) => !open)}
          >
            <Typography variant="h6">{team.name}</Typography>
          </Button>
        </BootstrapTooltip>
      </Box>

      <ModalWrapper open={open} onClose={() => setOpen(false)}>
        <CardThemed>
          <CardHeader
            title="Team Settings"
            action={<CloseButton onClick={() => setOpen(false)} />}
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
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
            <Typography variant="h6">Team Editor</Typography>
            <Alert severity="info" variant="filled">
              The first character in the team receives any "active on-field
              character" buffs
            </Alert>
            <TeamCharacterSelector teamId={teamId} />
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
function TeamCharacterSelector({ teamId }: { teamId: string }) {
  const database = useDatabase()
  const team = database.teams.get(teamId)!
  const { teamCharIds } = team
  const [charSelectIndex, setCharSelectIndex] = useState(
    undefined as number | undefined
  )
  const onSelect = (cKey: CharacterKey) => {
    if (charSelectIndex === undefined) return

    const existingIndex = teamCharIds.findIndex(
      (teamCharId) => database.teamChars.get(teamCharId)?.key === cKey
    )
    if (existingIndex < 0) {
      if (teamCharIds[charSelectIndex]) {
        // Already have a teamChar at destination, prompt for deletion
        if (
          !window.confirm(
            `Do you want to replace existing character with a new character? The loadouts and data (such as multi-opts) on this existing character will be deleted.`
          )
        )
          return
        // delete destination character
        const existingTeamCharId = teamCharIds[charSelectIndex]
        database.teamChars.remove(existingTeamCharId)
      }
      const teamCharId = database.teamChars.new(cKey)
      database.teams.set(teamId, (team) => {
        team.teamCharIds[charSelectIndex] = teamCharId
      })
    } else {
      if (charSelectIndex === existingIndex) return
      if (teamCharIds[charSelectIndex]) {
        // Already have a teamChar at destination, move to existing Index
        const existingTeamCharId = teamCharIds[existingIndex]
        const destinationTeamCharId = teamCharIds[charSelectIndex]
        database.teams.set(teamId, (team) => {
          team.teamCharIds[charSelectIndex] = existingTeamCharId
          team.teamCharIds[existingIndex] = destinationTeamCharId
        })
      }
    }
  }
  const onDel = (index: number) => () => {
    if (
      !window.confirm(
        `Do you want to delete this character? The loadouts and data (such as multi-opts) on this character will be deleted.`
      )
    )
      return
    const oldId = teamCharIds[index]
    database.teams.set(teamId, (team) => {
      delete team.teamCharIds[index]
    })
    database.teamChars.remove(oldId)
  }
  const charKeyAtIndex = database.teamChars.get(
    teamCharIds[charSelectIndex as number]
  )?.key
  return (
    <>
      <Suspense fallback={false}>
        <CharacterSelectionModal
          filter={(c) => charKeyAtIndex !== c?.key}
          show={charSelectIndex !== undefined}
          onHide={() => setCharSelectIndex(undefined)}
          onSelect={onSelect}
        />
      </Suspense>
      {range(0, 3).map((ind) =>
        teamCharIds[ind] ? (
          <CharSelButton
            key={ind}
            teamCharId={teamCharIds[ind]}
            onClick={() => setCharSelectIndex(ind)}
            onClose={onDel(ind)}
          />
        ) : (
          <Button
            key={ind}
            onClick={() => setCharSelectIndex(ind)}
            fullWidth
            sx={{ height: '100%' }}
            disabled={ind !== teamCharIds.length}
            startIcon={<AddIcon />}
          >
            Add Character
          </Button>
        )
      )}
    </>
  )
}
function CharSelButton({
  teamCharId,
  onClick,
  onClose,
}: {
  teamCharId: string
  onClick: () => void
  onClose: () => void
}) {
  const database = useDatabase()
  const { key: characterKey } = database.teamChars.get(teamCharId)!
  const { gender } = useDBMeta()
  return (
    <ButtonGroup fullWidth sx={{ height: '100%', alignItems: 'stretch' }}>
      <Button
        onClick={onClick}
        color={'success'}
        startIcon={<CharIconSide characterKey={characterKey} />}
      >
        <CharacterName characterKey={characterKey} gender={gender} />
      </Button>
      <Button
        onClick={onClose}
        color="error"
        sx={{ flexBasis: '0' }}
        // size="small"
      >
        <CloseIcon />
      </Button>
    </ButtonGroup>
  )
}
