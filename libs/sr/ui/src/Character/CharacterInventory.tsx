import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { Box, CardContent, CardHeader, Grid, Skeleton } from '@mui/material'
import { Suspense, useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import { CharacterCard } from './CharacterCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const amtPerSize = { xs: 5, sm: 5, md: 10, lg: 10, xl: 10 }

export function CharacterInventory() {
  const { database } = useDatabaseContext()
  const { characters } = useMemo(() => {
    const characters = database.chars.values
    return { characters }
  }, [database])

  const size = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    amtPerSize[size],
    characters.length
  )

  const charactersInView = useMemo(
    () => characters.slice(0, numShow),
    [characters, numShow]
  )

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
        <CardHeader title="Characters" />
        <CardContent>
          <Box
            sx={{ overflow: 'auto', maxHeight: '50vh' }}
            my={1}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Grid container spacing={1} columns={columns}>
              {charactersInView.map((c, i) => (
                <Grid item key={i} xs={1}>
                  <CharacterCard character={c} />
                </Grid>
              ))}
            </Grid>

            {characters.length !== charactersInView.length && (
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
