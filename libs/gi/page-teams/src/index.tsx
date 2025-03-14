import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  ShowingAndSortOptionSelect,
  useInfScroll,
  useTitle,
} from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import { teamSortKeys } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CharacterMultiAutocomplete, TeamCard } from '@genshin-optimizer/gi/ui'
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
import { useLocation, useNavigate } from 'react-router-dom'
import { teamFilterConfigs, teamSortConfigs, teamSortMap } from './TeamSort'

const columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }
const numToShowMap = { xs: 6, sm: 12, md: 18, lg: 24, xl: 24 }

export default function PageTeams() {
  const { t } = useTranslation([
    'page_team',
    'page_teams',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const database = useDatabase()
  const [dbDirty, forceUpdate] = useForceUpdate()
  const navigate = useNavigate()
  const location = useLocation()
  // Set follow, should run only once
  useEffect(() => {
    return database.teams.followAny(
      (k, r) =>
        (r === 'new' || r === 'remove' || r === 'update') && forceUpdate(),
    )
  }, [forceUpdate, database])

  // Account for the case of switching from a team -> teams page, since they have the same base /teams url
  useTitle()

  const onAdd = () => {
    const newid = database.teams.new()
    navigate(newid)
  }
  const [showImport, onShowImport, onHideImport] = useBoolState()
  const [data, setData] = useState('')
  // Automatically open the import modal if the state indicates to do so
  useEffect(() => {
    if (location.state?.openImportModal) {
      setData(location.state?.teamData)
      onShowImport()
    }
  }, [location.state, onShowImport, setData])
  const importData = () => {
    try {
      const dataObj = JSON.parse(data)
      if (!database.teams.import(dataObj))
        window.alert(t('importForm.error.verifi'))
      onHideImport()
    } catch (e) {
      window.alert(t('importForm.error.import') + `\n${e}`)

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
          teamFilterConfigs(database),
        ),
      )
      .sort((k1, k2) => {
        return sortFunction(
          teamSortMap[sortType],
          ascending,
          teamSortConfigs(),
        )(database.teams.get(k1)!, database.teams.get(k2)!)
      })
    return dbDirty && { teamIds, totalTeamNum }
  }, [dbDirty, database, charKeys, deferredSearchTerm, sortType, ascending])
  const brPt = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    teamIds.length,
  )

  const TeamIdsToShow = useMemo(
    () => teamIds.slice(0, numShow),
    [teamIds, numShow],
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
    <Box display="flex" flexDirection="column" gap={1}>
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
              label={t('searchLabel.team')}
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
          {t('addTeamBtn')}
        </Button>
        <ModalWrapper open={showImport} onClose={onHideImport}>
          <CardThemed>
            <CardHeader title={t('importForm.title')} />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography>{t('importForm.desc')}</Typography>
              <TextField
                fullWidth
                label={t('importForm.label')}
                placeholder={t('importForm.placeholder')}
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
                {t('importForm.importBtn')}
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
          {t('importTeamBtn')}
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
        <Grid container spacing={2} columns={columns}>
          {TeamIdsToShow.map((tid) => (
            <Grid item xs={1} key={tid}>
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width="100%" height={150} />
                }
              >
                <TeamCard
                  teamId={tid}
                  bgt="light"
                  onClick={(cid) => navigate(`${tid}${cid ? `/${cid}` : ''}`)}
                />
              </Suspense>
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
