import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
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
import TeamCard from './TeamCard'
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }

// TODO: Translation

export default function PageTeams() {
  const database = useDatabase()
  const [dbDirty, forceUpdate] = useForceUpdate()
  const teamIds = useMemo(
    () => dbDirty && database.teams.keys,
    [dbDirty, database]
  )
  const navigate = useNavigate()
  // Set follow, should run only once
  useEffect(() => {
    return database.teams.followAny(
      (k, r) => (r === 'new' || r === 'remove') && forceUpdate()
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
  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
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
                onClick={() => navigate(`${tid}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Box>
  )
}
