import { useBoolState } from '@genshin-optimizer/common/react-util'
import { TextFieldLazy } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { TeamData, dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  AdResponsive,
  CharIconSide,
  CharacterName,
  CharacterSelectionModal,
  EnemyExpandCard,
  TeamInfoAlert,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import type { ButtonProps } from '@mui/material'
import { Alert, Box, Button, CardContent, Grid } from '@mui/material'
import { Suspense, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BuildDropdown from '../BuildDropdown'
import { LoadoutDropdown } from '../LoadoutDropdown'
import { ResonanceDisplay } from './ResonanceDisplay'
import { TeammateDisplay } from './TeamComponents'
import TeamDelModal from './TeamDelModal'
import TeamExportModal from './TeamExportModal'

// TODO: Translation
export default function TeamSetting({
  teamId,
  teamData,
}: {
  teamId: string
  teamData?: TeamData
  buttonProps?: ButtonProps
}) {
  const navigate = useNavigate()
  const database = useDatabase()
  const [show, onShow, onHide] = useBoolState()
  const team = database.teams.get(teamId)!
  const noChars = team.loadoutData.every((id) => !id)
  const { name, description } = team

  const onDelNoChars = () => {
    database.teams.remove(teamId)
    navigate(`/teams`)
  }

  const onDup = () => {
    const newTeamId = database.teams.duplicate(teamId)
    navigate(`/teams/${newTeamId}`)
  }
  const [showDel, onShowDel, onHideDel] = useBoolState()
  return (
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TeamInfoAlert />
      <TextFieldLazy
        fullWidth
        label="Team Name"
        placeholder="Team Name"
        value={name}
        onChange={(name) => database.teams.set(teamId, { name })}
      />
      <TextFieldLazy
        fullWidth
        label="Team Description"
        value={description}
        onChange={(description) => database.teams.set(teamId, { description })}
        multiline
        minRows={2}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TeamExportModal show={show} teamId={teamId} onHide={onHide} />
        <Button
          color="info"
          sx={{ flexGrow: 1 }}
          startIcon={<ContentPasteIcon />}
          disabled={noChars}
          onClick={onShow}
        >
          Export Team
        </Button>
        <Button
          color="info"
          sx={{ flexGrow: 1 }}
          disabled={noChars}
          onClick={onDup}
          startIcon={<ContentCopyIcon />}
        >
          Duplicate Team
        </Button>
        <TeamDelModal
          teamId={teamId}
          show={showDel}
          onHide={onHideDel}
          onDel={() => navigate(`/teams`)}
        />
        <Button
          color="error"
          sx={{ flexGrow: 1 }}
          onClick={noChars ? onDelNoChars : onShowDel}
          startIcon={<DeleteForeverIcon />}
        >
          Delete Team
        </Button>
      </Box>
      <EnemyExpandCard teamId={teamId} />
      <TeamEditor teamId={teamId} teamData={teamData} />
    </CardContent>
  )
}
function TeamEditor({
  teamId,
  teamData,
}: {
  teamId: string
  teamData?: TeamData
}) {
  const database = useDatabase()
  const team = database.teams.get(teamId)!
  const { loadoutData } = team
  const [charSelectIndex, setCharSelectIndex] = useState(
    undefined as number | undefined
  )
  const onSelect = (cKey: CharacterKey) => {
    if (charSelectIndex === undefined) return

    // Make sure character exists
    database.chars.getWithInitWeapon(cKey)

    const existingIndex = loadoutData.findIndex(
      (loadoutDatum) =>
        loadoutDatum &&
        database.teamChars.get(loadoutDatum.teamCharId)?.key === cKey
    )
    if (existingIndex < 0) {
      //find the first available teamchar
      let teamCharId = database.teamChars.keys.find(
        (k) => database.teamChars.get(k)!.key === cKey
      )
      // if there is no teamchar, create one.
      if (!teamCharId) teamCharId = database.teamChars.new(cKey)
      database.teams.set(teamId, (team) => {
        if (!teamCharId) return
        team.loadoutData[charSelectIndex] = { teamCharId } as LoadoutDatum
      })
    } else {
      if (charSelectIndex === existingIndex) return
      if (loadoutData[charSelectIndex]) {
        // Already have a teamChar at destination, move to existing Index
        const existingLoadoutDatum = loadoutData[existingIndex]
        const destinationLoadoutDatum = loadoutData[charSelectIndex]
        database.teams.set(teamId, (team) => {
          team.loadoutData[charSelectIndex] = existingLoadoutDatum
          team.loadoutData[existingIndex] = destinationLoadoutDatum
        })
      }
    }
  }
  const charKeyAtIndex = database.teamChars.get(
    loadoutData[charSelectIndex as number]?.teamCharId
  )?.key

  const firstTeamCharId = loadoutData[0]?.teamCharId
  const firstTeamCharKey =
    firstTeamCharId && database.teamChars.get(firstTeamCharId)?.key
  const charData = firstTeamCharKey && teamData?.[firstTeamCharKey]
  const charUIData = charData ? charData.target : undefined

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])
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
      <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
        <Grid item xs={1}>
          <ResonanceDisplay
            teamId={teamId}
            team={team}
            dataContextValue={dataContextValue}
          />
        </Grid>
        <Grid item xs={1}>
          <AdResponsive bgt="light" dataAdSlot="5102492054" maxHeight={400} />
        </Grid>
      </Grid>
      <Alert severity="info">
        The first character in the team receives any "active on-field character"
        buffs, and cannot be empty.
      </Alert>
      <Grid container columns={{ xs: 1, md: 2, lg: 4 }} spacing={2}>
        {loadoutData.map((loadoutDatum, ind) => (
          <Grid item xs={1} key={loadoutDatum?.teamCharId ?? ind}>
            {loadoutDatum ? (
              <CharSelButton
                index={ind}
                key={loadoutDatum?.teamCharId}
                teamId={teamId}
                loadoutDatum={loadoutDatum}
                onClickChar={() => setCharSelectIndex(ind)}
                teamData={teamData}
              />
            ) : (
              <Button
                key={ind}
                onClick={() => setCharSelectIndex(ind)}
                fullWidth
                disabled={!!ind && !loadoutData.some((id) => id)}
                startIcon={<AddIcon />}
              >
                Add Character
              </Button>
            )}
          </Grid>
        ))}
      </Grid>
    </>
  )
}
function CharSelButton({
  index,
  teamId,
  loadoutDatum,
  teamData,
  onClickChar,
}: {
  index: number
  teamId: string
  loadoutDatum: LoadoutDatum
  teamData?: TeamData
  onClickChar: () => void
}) {
  const database = useDatabase()
  const { teamCharId } = loadoutDatum
  const { key: characterKey } = database.teamChars.get(teamCharId)!
  const { gender } = useDBMeta()
  const onChangeTeamCharId = (teamCharId: string) => {
    database.teams.set(teamId, (team) => {
      team.loadoutData[index] = { teamCharId } as LoadoutDatum
    })
  }
  const onActive = () => {
    // Swap the active with current loadout
    database.teams.set(teamId, (team) => {
      const oldActive = team.loadoutData[0]
      team.loadoutData[0] = loadoutDatum
      team.loadoutData[index] = oldActive
    })
  }

  const onDel = () =>
    database.teams.set(teamId, (team) => {
      team.loadoutData[index] = undefined
    })

  const charData = characterKey && teamData?.[characterKey]
  const charUIData = charData ? charData.target : undefined

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])

  return (
    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          onClick={onClickChar}
          color={'success'}
          sx={{ flexGrow: 1 }}
          startIcon={<CharIconSide characterKey={characterKey} />}
        >
          <CharacterName characterKey={characterKey} gender={gender} />
        </Button>
        <Button onClick={onDel} color="error" sx={{ p: 1, minWidth: 0 }}>
          <CloseIcon />
        </Button>
      </Box>
      <LoadoutDropdown
        teamCharId={teamCharId}
        onChangeTeamCharId={onChangeTeamCharId}
        dropdownBtnProps={{ fullWidth: true }}
      />
      <BuildDropdown
        teamId={teamId}
        loadoutDatum={loadoutDatum}
        dropdownBtnProps={{ fullWidth: true }}
      />
      {index ? (
        <Button onClick={onActive} color="info">
          To Field
        </Button>
      ) : (
        <Button disabled color="info">
          On-field Character
        </Button>
      )}
      {dataContextValue && (
        <TeammateDisplay
          dataContextValue={dataContextValue}
          teamCharId={teamCharId}
          teamId={teamId}
        />
      )}
    </Box>
  )
}
