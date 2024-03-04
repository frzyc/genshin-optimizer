import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
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
import { LoadoutDropdown } from './LoadoutDropdown'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import GroupsIcon from '@mui/icons-material/Groups'
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
      <BootstrapTooltip title={<Typography>{team.description}</Typography>}>
        <Button
          color="info"
          sx={{ flexGrow: 1 }}
          startIcon={<GroupsIcon />}
          endIcon={<DriveFileRenameOutlineIcon />}
          onClick={() => setOpen((open) => !open)}
        >
          <Typography variant="h6">{team.name}</Typography>
        </Button>
      </BootstrapTooltip>

      <ModalWrapper open={open} onClose={() => setOpen(false)}>
        <CardThemed>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <GroupsIcon />
                <span>Team Settings</span>
              </Box>
            }
            action={<CloseButton onClick={() => setOpen(false)} />}
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Alert variant="filled" severity="info">
              <strong>Teams</strong> are a container for 4 character loadouts.
              It provides a way for characters to apply team buffs, and
              configuration of enemy stats. Loadouts can be shared between
              teams.
            </Alert>
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
              character" buffs, and cannot be empty.
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

    // Make sure character exists
    database.chars.getWithInitWeapon(cKey)

    const existingIndex = teamCharIds.findIndex(
      (teamCharId) => database.teamChars.get(teamCharId)?.key === cKey
    )
    if (existingIndex < 0) {
      //find the first available teamchar
      let teamCharId = database.teamChars.keys.find(
        (k) => database.teamChars.get(k)!.key === cKey
      )
      // if there is no teamchar, create one.
      if (!teamCharId) teamCharId = database.teamChars.new(cKey)
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
  const charKeyAtIndex = database.teamChars.get(
    teamCharIds[charSelectIndex as number]
  )?.key

  return (
    <>
      <Suspense fallback={false}>
        <CharacterSelectionModal
          filter={(c) => c !== charKeyAtIndex}
          show={charSelectIndex !== undefined}
          onHide={() => setCharSelectIndex(undefined)}
          onSelect={onSelect}
        />
      </Suspense>
      {teamCharIds.map((teamCharId, ind) =>
        teamCharId ? (
          <CharSelButton
            index={ind}
            key={teamCharId}
            teamId={teamId}
            teamCharId={teamCharId}
            onClickChar={() => setCharSelectIndex(ind)}
          />
        ) : (
          <Button
            key={ind}
            onClick={() => setCharSelectIndex(ind)}
            fullWidth
            sx={{ height: '100%' }}
            disabled={!!ind && !teamCharIds.some((id) => id)}
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
  index,
  teamId,
  teamCharId,
  onClickChar,
}: {
  index: number
  teamId: string
  teamCharId: string
  onClickChar: () => void
}) {
  const database = useDatabase()
  const { key: characterKey } = database.teamChars.get(teamCharId)!
  const { gender } = useDBMeta()
  const onChangeTeamCharId = (teamCharId: string) => {
    database.teams.set(teamId, (team) => {
      team.teamCharIds[index] = teamCharId
    })
  }
  const onActive = () => {
    // Swap the active with current loadout
    database.teams.set(teamId, (team) => {
      const oldActive = team.teamCharIds[0]
      team.teamCharIds[0] = teamCharId
      team.teamCharIds[index] = oldActive
    })
  }

  const onDel = () =>
    database.teams.set(teamId, (team) => {
      team.teamCharIds[index] = undefined
    })
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onClickChar}
            color={'success'}
            startIcon={<CharIconSide characterKey={characterKey} />}
          >
            <CharacterName characterKey={characterKey} gender={gender} />
          </Button>
          <LoadoutDropdown
            teamCharId={teamCharId}
            onChangeTeamCharId={onChangeTeamCharId}
            dropdownBtnProps={{ sx: { flexGrow: 1 } }}
          />
          {!!index && (
            <Button
              onClick={onActive}
              startIcon={<ArrowUpwardIcon />}
              color="info"
            >
              Active
            </Button>
          )}
          <Button onClick={onDel} color="error" sx={{ flexBasis: '0' }}>
            <CloseIcon />
          </Button>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
