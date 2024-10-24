import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { useDatabaseContext } from '@genshin-optimizer/sr/ui'
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
import { ComboCard } from './ComboCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const amtPerSize = { xs: 5, sm: 5, md: 10, lg: 10, xl: 10 }

export function ComboInventory() {
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  useEffect(
    () => database.combos.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const navigate = useNavigate()

  const { comboIds } = useMemo(() => {
    const comboIds = database.combos.keys
    return dirtyDatabase && { comboIds }
  }, [database, dirtyDatabase])

  const size = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    amtPerSize[size],
    comboIds.length
  )

  const comboIdsToShow = useMemo(
    () => comboIds.slice(0, numShow),
    [comboIds, numShow]
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
        <CardHeader title="Combos" />
        <CardContent>
          <Button onClick={() => database.combos.new()}>Create Combo</Button>
          <Box
            sx={{ overflow: 'auto', maxHeight: '50vh' }}
            my={1}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Grid container spacing={1} columns={columns}>
              {comboIdsToShow.map((comboId) => (
                <Grid item key={comboId} xs={1}>
                  <ComboCard
                    teamId={comboId}
                    onClick={(charId) =>
                      navigate(`${comboId}${charId ? `/${charId}` : ''}`)
                    }
                  />
                </Grid>
              ))}
            </Grid>

            {comboIds.length !== comboIdsToShow.length && (
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
