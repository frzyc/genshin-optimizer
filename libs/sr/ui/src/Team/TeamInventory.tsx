import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
} from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import { TeamCard } from './TeamCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const amtPerSize = { xs: 5, sm: 5, md: 10, lg: 10, xl: 10 }

export function TeamInventory() {
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(
    () => database.teams.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const { teams } = useMemo(() => {
    const teams = database.teams.values
    return dirtyDatabase && { teams }
  }, [database.teams.values, dirtyDatabase])

  const size = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    amtPerSize[size],
    teams.length
  )

  const teamsInView = useMemo(() => teams.slice(0, numShow), [teams, numShow])

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ widht: '100%', height: '100%', minHeight: 300 }}
        />
      }
    >
      <CardThemed bgt="dark">
        <CardHeader title="Teams" />
        <CardContent>
          <Button onClick={() => database.teams.new()}>Create Team</Button>
          <Box
            sx={{ overflow: 'auto', maxHeight: '50vh' }}
            my={1}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Grid container spacing={1} columns={columns}>
              {teamsInView.map((t, i) => (
                <Grid item key={i} xs={1}>
                  <TeamCard team={t} />
                </Grid>
              ))}
            </Grid>

            {teams.length !== teamsInView.length && (
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
        </CardContent>
      </CardThemed>
    </Suspense>
  )
}
