import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import type { Team } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TeamCard from './TeamCard'
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
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
    const newid = database.teams.new({} as Team)
    navigate(newid)
  }

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Button fullWidth onClick={onAdd} color="info" startIcon={<AddIcon />}>
        Add Team
      </Button>
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
            <Grid item key={tid}>
              <TeamCard teamId={tid} onClick={() => navigate(`${tid}`)} />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Box>
  )
}
