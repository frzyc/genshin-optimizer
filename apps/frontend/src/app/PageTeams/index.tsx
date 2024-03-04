import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { sortFunction } from '@genshin-optimizer/common/util'
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
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SortByButton from '../Components/SortByButton'
import TeamCard from './TeamCard'
import { teamSortConfigs, teamSortMap } from './TeamSort'
import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }

// TODO: Translation

export default function PageTeams() {
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
  const { sortType, ascending } = useDataEntryBase(database.displayTeam)

  // Currently using the BD key as an ID maybe later will need to add an ID entry to Team
  const teamIds = useMemo(
    () =>
      dbDirty &&
      database.teams.keys.sort((k1, k2) => {
        return sortFunction(
          teamSortMap[sortType],
          ascending,
          teamSortConfigs()
        )(database.teams.get(k1)!, database.teams.get(k2)!)
      }),
    [dbDirty, database.teams, sortType, ascending]
  )

  const sortByButtonProps = {
    sortKeys: [...teamSortKeys],
    value: sortType,
    onChange: (sortType) => database.displayTeam.set({ sortType }),
    ascending: ascending,
    onChangeAsc: (ascending) => database.displayTeam.set({ ascending }),
  }

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {/* May use `PageAndSortOptionSelect` to add multiple pages and filter count later */}
        <SortByButton {...sortByButtonProps} />
      </Box>
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
          {teamIds.map((tid) => (
            <Grid item xs={1} key={tid}>
              <TeamCard
                teamId={tid}
                bgt="light"
                onClick={(cid) => navigate(`${tid}${cid ? `/${cid}` : ''}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Box>
  )
}
