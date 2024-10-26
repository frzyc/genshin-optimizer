import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
} from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const navigate = useNavigate()

  const { teamIds } = useMemo(() => {
    const teamIds = database.teams.keys
    return dirtyDatabase && { teamIds }
  }, [database, dirtyDatabase])

  const size = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    amtPerSize[size],
    teamIds.length
  )

  const teamIdsToShow = useMemo(
    () => teamIds.slice(0, numShow),
    [teamIds, numShow]
  )

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 300 }}
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
              {teamIdsToShow.map((teamId) => (
                <Grid item key={teamId} xs={1}>
                  <TeamCard
                    teamId={teamId}
                    onClick={(charId) =>
                      navigate(`${teamId}${charId ? `/${charId}` : ''}`)
                    }
                  />
                </Grid>
              ))}
            </Grid>

            {teamIds.length !== teamIdsToShow.length && (
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
