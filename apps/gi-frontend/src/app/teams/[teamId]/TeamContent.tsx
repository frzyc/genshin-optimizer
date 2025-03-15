'use client'
import { CardThemed, TextFieldLazy } from '@genshin-optimizer/common/ui'
import { notEmpty, range } from '@genshin-optimizer/common/util'
import type { SelectChangeEvent } from '@mui/material'
import {
  Button,
  CardActionArea,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { useSupabase } from '../../../utils/supabase/client'
import type { Characters } from '../../characters/getCharacters'
import type { Loadouts } from '../getLoadouts'
import type { Team, TeamLoadout, TeamLoadoutCharacter } from './getTeam'

// a format mostly for changing loadouts in a team.
type TeamLoadoutData = {
  loadout: {
    id: string
    character_id: string
    character_key: TeamLoadoutCharacter['key']
    name: Exclude<TeamLoadout['loadout'], null>['name']
    description: Exclude<TeamLoadout['loadout'], null>['description']
  }
  index: number
  build_type: TeamLoadout['build_type']
}

export function TeamContent({
  accountId,
  team,
  loadouts,
  characters,
}: {
  accountId: string
  team: Team
  loadouts: Loadouts
  characters: Characters
}) {
  const supabase = useSupabase()
  const [teamLoadouts, setTeamLoadouts] = useState(() =>
    range(0, 3)
      .map((i) => team.team_loadouts.find(({ index }) => index === i) ?? null)
      .map((team_loadout) => {
        if (!team_loadout || !team_loadout.loadout) return null
        const {
          loadout: { id, character_id, character_key, name, description },
          index,
          build_type,
        } = team_loadout
        return {
          loadout: { id, character_id, character_key, name, description },
          index,
          build_type,
        } as TeamLoadoutData
      }),
  )
  const saveTeamLoadouts = async () => {
    const { error } = await supabase.from('team_loadouts').upsert(
      (
        await Promise.all(
          teamLoadouts.map(async (teamLoadout) => {
            if (!teamLoadout) return null
            const loadout = teamLoadout.loadout
            if (loadout && loadout.id === 'new') {
              const { data, error } = await supabase
                .from('loadouts')
                .insert({
                  character_id: loadout.character_id,
                  character_key: loadout.character_key,
                  name: loadout.name,
                  description: loadout.description,
                  account_id: accountId,
                })
                .select()
                .maybeSingle()
              if (error || !data) {
                console.error(error)
                return null
              }
              teamLoadout.loadout = {
                ...data,
              }
            }

            return {
              loadout_id: teamLoadout.loadout!.id,
              team_id: team.id,
              index: teamLoadout.index,
              build_type: teamLoadout?.build_type ?? null,
            }
          }),
        )
      ).filter(notEmpty),
    )
    // .select()
    if (error) console.error(error)
    // TODO: optimistic update or realtime
    location.reload()
  }
  return (
    <CardThemed>
      <CardContent>
        <Typography>{team.name ?? 'Team Name'}</Typography>
        <TextFieldLazy
          value={team.name ?? ''}
          onChange={async (newName) => {
            if (!newName) return
            const { error } = await supabase
              .from('teams')
              .update({
                name: newName,
              })
              .eq('id', team.id)
            if (error) console.error(error)
            // TODO: optimistic update or realtime
            location.reload()
          }}
        />
        <Typography>{team.description ?? 'Team Description'}</Typography>
        <Stack spacing={1}>
          {teamLoadouts.map((teamLoadout, i) => (
            <Teammate
              key={i}
              index={i}
              characters={characters}
              loadouts={loadouts}
              teamLoadout={teamLoadout}
              setTeamLoadouts={setTeamLoadouts}
            />
          ))}
          <Button onClick={saveTeamLoadouts}>Save</Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function Teammate({
  index,
  characters,
  loadouts,
  teamLoadout,
  setTeamLoadouts,
}: {
  index: number
  characters: Characters
  loadouts: Loadouts
  teamLoadout: TeamLoadoutData | null
  setTeamLoadouts: Dispatch<SetStateAction<Array<TeamLoadoutData | null>>>
}) {
  const [selectedCharId, setSelectedCharId] = useState(
    teamLoadout?.loadout?.character_id ?? '',
  )
  const handleCharChange = (event: SelectChangeEvent) => {
    setSelectedCharId(event.target.value as string)
  }
  const loadoutsOfChar = loadouts.filter(
    ({ character_key }) =>
      characters.find(({ id }) => id === selectedCharId)?.key === character_key,
  )
  const [selectedLoadoutId, setSelectedLoadoutId] = useState(
    teamLoadout?.loadout?.id ?? 'new',
  )
  const handleLoadoutChange = (event: SelectChangeEvent) => {
    setSelectedLoadoutId(event.target.value as string)
  }

  useEffect(() => {
    const tloadout =
      teamLoadout ||
      ({
        index,
        build_type: 'equipped',
      } as TeamLoadoutData)
    if (selectedLoadoutId === 'new') {
      const selectedChar = characters.find(({ id }) => id === selectedCharId)
      if (!selectedChar) return
      tloadout.loadout = {
        id: 'new',
        character_id: selectedCharId,
        character_key: selectedChar.key,
        name: null,
        description: null,
      }
    } else {
      const selectedLoadout = loadouts.find(
        ({ id }) => id === selectedLoadoutId,
      )
      if (!selectedLoadout) return
      tloadout.loadout = {
        id: selectedLoadout.id,
        character_id: selectedLoadout.character_id,
        character_key: selectedLoadout.character_key,
        name: selectedLoadout.name,
        description: selectedLoadout.description,
      }
    }

    setTeamLoadouts((old) => {
      const newTeamLoadouts = [...old]
      newTeamLoadouts[index] = tloadout
      return newTeamLoadouts
    })
  }, [
    characters,
    index,
    loadouts,
    selectedCharId,
    selectedLoadoutId,
    setTeamLoadouts,
    teamLoadout,
  ])
  return (
    <CardThemed bgt="light">
      <CardActionArea>
        <CardContent>
          <Typography>Teammate {index + 1}</Typography>
          <FormControl fullWidth>
            <InputLabel>Select Character</InputLabel>
            <Select
              fullWidth
              value={selectedCharId}
              label="Select Character"
              onChange={handleCharChange}
            >
              {characters.map(({ id, key }) => (
                <MenuItem key={key} value={id}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedCharId && (
            <FormControl fullWidth>
              <InputLabel>Select Loadout</InputLabel>
              <Select
                fullWidth
                value={selectedLoadoutId}
                label="Select Loadout"
                onChange={handleLoadoutChange}
              >
                <MenuItem value="new">New Loadout</MenuItem>
                {loadoutsOfChar.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name ?? 'Loadout Name'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </CardContent>
      </CardActionArea>
    </CardThemed>
  )
}
