import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  useOnScreen,
} from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import { teamSortKeys } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AddIcon from '@mui/icons-material/Add'
import UploadIcon from '@mui/icons-material/Upload'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CharacterMultiAutocomplete } from '../Components/Character/CharacterMultiAutocomplete'
import ShowingAndSortOptionSelect from '../Components/ShowingAndSortOptionSelect'
import TeamCard from './TeamCard'
import { teamFilterConfigs, teamSortConfigs, teamSortMap } from './TeamSort'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }
const numToShowMap = { xs: 6, sm: 12, md: 18, lg: 24, xl: 24 }

// TODO: Translation

export default function PageTeams() {
  const { t } = useTranslation([
    'page_teams',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const database = useDatabase()
  const [dbDirty, forceUpdate] = useForceUpdate()
  const navigate = useNavigate()
  // Set follow, should run only once
  useEffect(() => {
    return database.teams.followAny(
      (k, r) =>
        (r === 'new' || r === 'remove' || r === 'update') && forceUpdate()
    )
  }, [forceUpdate, database])

  const onAdd = () => {
    const newid = database.teams.new()
    navigate(newid)
  }
  const [showImport, onShowImport, onHideImport] = useBoolState()
  const [data, setData] = useState('')
  const importData = () => {
    try {
      const dataObj = JSON.parse(data)
      if (!database.teams.import(dataObj))
        window.alert(`Data verification failed.`)
      onHideImport()
    } catch (e) {
      window.alert(`Data Import failed. ${e}`)
      return
    }
  }
  const displayTeam = useDataEntryBase(database.displayTeam)
  const { sortType, ascending, charKeys } = displayTeam

  const [searchTerm, setSearchTerm] = useState(displayTeam.searchTerm)
  const deferredSearchTerm = useDeferredValue(searchTerm)
  useEffect(() => {
    database.displayTeam.set({ searchTerm: deferredSearchTerm })
  }, [database, deferredSearchTerm])

  // Currently using the BD key as an ID maybe later will need to add an ID entry to Team
  const { teamIds, totalTeamNum } = useMemo(() => {
    const totalTeamNum = database.teams.keys.length
    const teamIds = database.teams.keys
      .filter(
        filterFunction(
          { charKeys, name: deferredSearchTerm },
          teamFilterConfigs(database)
        )
      )
      .sort((k1, k2) => {
        return sortFunction(
          teamSortMap[sortType],
          ascending,
          teamSortConfigs()
        )(database.teams.get(k1)!, database.teams.get(k2)!)
      })
    return dbDirty && { teamIds, totalTeamNum }
  }, [dbDirty, database, charKeys, deferredSearchTerm, sortType, ascending])
  const brPt = useMediaQueryUp()
  const [numShow, setNumShow] = useState(numToShowMap[brPt])
  // reset the numShow when artifactIds changes
  useEffect(() => {
    teamIds && setNumShow(numToShowMap[brPt])
  }, [teamIds, brPt])

  const [triggerElement, setTriggerElement] = useState<
    HTMLElement | undefined
  >()
  const trigger = useOnScreen(triggerElement)
  const shouldIncrease = trigger && numShow < teamIds.length
  useEffect(() => {
    if (!shouldIncrease) return
    setNumShow((num) => num + numToShowMap[brPt])
  }, [shouldIncrease, brPt])

  const TeamIdsToShow = useMemo(
    () => teamIds.slice(0, numShow),
    [teamIds, numShow]
  )

  const totalShowing =
    teamIds.length !== totalTeamNum
      ? `${teamIds.length}/${totalTeamNum}`
      : `${totalTeamNum}`

  const showingTextProps = {
    numShowing: TeamIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'page_teams',
  }

  const sortByButtonProps = {
    sortKeys: [...teamSortKeys],
    value: sortType,
    onChange: (sortType) => database.displayTeam.set({ sortType }),
    ascending: ascending,
    onChangeAsc: (ascending) => database.displayTeam.set({ ascending }),
  }

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box display="flex" gap={1} alignItems="stretch">
            <CharacterMultiAutocomplete
              teamIds={teamIds}
              charKeys={charKeys}
              setCharKey={(charKeys) => database.displayTeam.set({ charKeys })}
              acProps={{ sx: { flexGrow: 1 } }}
            />
            <TextField
              autoFocus
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setSearchTerm(e.target.value)
              }
              label="Team Name"
              // size="small"
              sx={{ height: '100%', flexGrow: 1 }}
              InputProps={{
                sx: { height: '100%' },
              }}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <ShowingAndSortOptionSelect
              showingTextProps={showingTextProps}
              sortByButtonProps={sortByButtonProps}
            />
          </Box>
        </CardContent>
      </CardThemed>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button fullWidth onClick={onAdd} color="info" startIcon={<AddIcon />}>
          Add Team
        </Button>
        <ModalWrapper open={showImport} onClose={onHideImport}>
          <CardThemed>
            <CardHeader title="Import Team" />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography>Import a team in JSON form below.</Typography>
              <TextField
                fullWidth
                label="JSON Data"
                placeholder="Paste your Team JSON here"
                value={data}
                onChange={(e) => setData(e.target.value)}
                multiline
                rows={4}
              />
              <Button
                startIcon={<UploadIcon />}
                disabled={!data}
                onClick={importData}
              >
                Import
              </Button>
            </CardContent>
          </CardThemed>
        </ModalWrapper>
        <Button
          fullWidth
          onClick={onShowImport}
          color="info"
          startIcon={<UploadIcon />}
        >
          Import Team
        </Button>
      </Box>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {TeamIdsToShow.map((tid) => (
            <Grid item xs={1} key={tid}>
              <TeamCard
                teamId={tid}
                bgt="light"
                onClick={(cid) => navigate(`${tid}${cid ? `/${cid}` : ''}`)}
                hoverCard
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
      {teamIds.length !== TeamIdsToShow.length && (
        <Skeleton
          ref={(node) => {
            if (!node) return
            setTriggerElement(node)
          }}
          sx={{ borderRadius: 1 }}
          variant="rectangular"
          width="100%"
          height={100}
        />
      )}
    </Box>
  )
}
