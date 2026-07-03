import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { TeamData, dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  CharIconSide,
  CharacterMultiSelectionModal,
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import Filter4Icon from '@mui/icons-material/Filter4'
import { Alert, Box, Button, Grid, Typography } from '@mui/material'
import { Suspense, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import BuildDropdown from '../BuildDropdown'
import { LoadoutDropdown } from '../LoadoutDropdown'
import { TeammateDisplay } from './TeamComponents'

export function TeamMembersEditor({
  teamId,
  teamData,
  charSelectIndex: charSelectIndexProp,
  onCharSelectIndex: onCharSelectIndexProp,
}: {
  teamId: string
  teamData?: TeamData
  /** When set, single-select modal is driven by the parent (e.g. compact teammate slots). */
  charSelectIndex?: number | undefined
  onCharSelectIndex?: (index: number | undefined) => void
}) {
  const { t } = useTranslation('page_team')
  const { t: tk } = useTranslation('teams_gen')
  const database = useDatabase()
  const team = database.teams.get(teamId)!
  const { loadoutData } = team

  const [charSelectIndexLocal, setCharSelectIndexLocal] = useState<
    number | undefined
  >()
  const charSelectIndex = charSelectIndexProp ?? charSelectIndexLocal
  const onCharSelectIndex =
    onCharSelectIndexProp ??
    ((index: number | undefined) => setCharSelectIndexLocal(index))

  const onSelect = (cKey: CharacterKey, selectedIndex: number) => {
    database.chars.getWithInitWeapon(cKey)

    const existingIndex = loadoutData.findIndex(
      (loadoutDatum) =>
        loadoutDatum &&
        database.teamChars.get(loadoutDatum.teamCharId)?.key === cKey
    )
    if (existingIndex < 0) {
      let teamCharId = database.teamChars.keys.find(
        (k) => database.teamChars.get(k)!.key === cKey
      )
      if (!teamCharId) teamCharId = database.teamChars.new(cKey)
      database.teams.set(teamId, (team) => {
        if (!teamCharId) return
        team.loadoutData[selectedIndex] = { teamCharId } as LoadoutDatum
      })
    } else {
      if (selectedIndex === existingIndex) return
      if (loadoutData[selectedIndex]) {
        const existingLoadoutDatum = loadoutData[existingIndex]
        const destinationLoadoutDatum = loadoutData[selectedIndex]
        database.teams.set(teamId, (team) => {
          team.loadoutData[selectedIndex] = existingLoadoutDatum
          if (
            team.loadoutData[existingIndex]?.teamCharId ===
            existingLoadoutDatum?.teamCharId
          ) {
            team.loadoutData[existingIndex] = destinationLoadoutDatum
          }
        })
      } else if (
        database.teams.get(teamId)!.loadoutData[existingIndex]?.teamCharId !==
        loadoutData[existingIndex]!.teamCharId
      ) {
        database.teams.set(teamId, (team) => {
          team.loadoutData[selectedIndex] = loadoutData[existingIndex]
        })
      }
    }
  }

  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const onSingleSelect = (cKey: CharacterKey) => {
    if (charSelectIndex === undefined) return
    onSelect(cKey, charSelectIndex)
    onCharSelectIndex(undefined)
  }
  const onMultiSelect = (cKeys: (CharacterKey | '')[]) => {
    const filteredKeys = cKeys.filter((key) => key !== '')
    for (let i = 0; i < filteredKeys.length; ++i) {
      const key = filteredKeys[i]
      onSelect(key, i)
    }

    const numSlotsEmpty = team.loadoutData.length - filteredKeys.length
    for (let j = 1; j <= numSlotsEmpty; ++j) {
      database.teams.set(teamId, (team) => {
        team.loadoutData[team.loadoutData.length - j] = undefined
      })
    }
  }

  return (
    <>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={!showMultiSelect && charSelectIndex !== undefined}
          onHide={() => onCharSelectIndex(undefined)}
          onSelect={onSingleSelect}
          selectedIndex={charSelectIndex}
          loadoutData={loadoutData}
        />
      </Suspense>
      <Suspense fallback={false}>
        <CharacterMultiSelectionModal
          show={showMultiSelect}
          onHide={() => setShowMultiSelect(false)}
          onSelect={onMultiSelect}
          loadoutData={loadoutData}
        />
      </Suspense>
      <Alert severity="info">
        <Trans t={t} i18nKey={'teamSettings.alert.first'}>
          The first character in the team receives any "active on-field
          character" buffs, and cannot be empty.
        </Trans>
      </Alert>
      <Grid container sx={{ justifyContent: 'space-between' }} spacing={2}>
        <Grid item>
          <Typography variant="h5">{t('teamSettings.title')}</Typography>
        </Grid>
        <Grid item>
          <Button
            startIcon={<Filter4Icon />}
            onClick={() => setShowMultiSelect(true)}
          >
            {tk('quickSetup')}
          </Button>
        </Grid>
      </Grid>
      <Grid container columns={{ xs: 1, md: 2, lg: 4 }} spacing={2}>
        {loadoutData.map((loadoutDatum, ind) => (
          <Grid item xs={1} key={loadoutDatum?.teamCharId ?? ind}>
            {loadoutDatum ? (
              <TeamMemberSlot
                index={ind}
                teamId={teamId}
                loadoutDatum={loadoutDatum}
                onClickChar={() => onCharSelectIndex(ind)}
                teamData={teamData}
              />
            ) : (
              <Button
                onClick={() => onCharSelectIndex(ind)}
                fullWidth
                disabled={!!ind && !loadoutData.some((id) => id)}
                startIcon={<AddIcon />}
              >
                {t('teamSettings.addCharBtn')}
              </Button>
            )}
          </Grid>
        ))}
      </Grid>
    </>
  )
}

function TeamMemberSlot({
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
  const { t } = useTranslation('page_team')
  const database = useDatabase()
  const { teamCharId } = loadoutDatum
  const { key: characterKey } = database.teamChars.get(teamCharId)!
  const { gender } = useDBMeta()
  const onChangeTeamCharId = (newTeamCharId: string) => {
    database.teams.set(teamId, (team) => {
      team.loadoutData[index] = { teamCharId: newTeamCharId } as LoadoutDatum
    })
  }
  const onActive = () => {
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
          {t('teamSettings.toFieldBtn')}
        </Button>
      ) : (
        <Button disabled color="info">
          {t('teamSettings.onFieldBtn')}
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
