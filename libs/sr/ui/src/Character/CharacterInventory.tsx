import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { Box, CardHeader, Grid, Skeleton } from '@mui/material'
import { Suspense, useMemo, useState } from 'react'
import { CharacterCard } from './CharacterCard'
import { CharacterEditor } from './CharacterEditor'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const amtPerSize = { xs: 5, sm: 5, md: 10, lg: 10, xl: 10 }

export function CharacterInventory() {
  const { database } = useDatabaseContext()
  const characters = useDataManagerValues(database.chars)

  const size = useMediaQueryUp()

  const { numShow, setTriggerElement } = useInfScroll(
    amtPerSize[size],
    characters.length
  )

  const charactersInView = useMemo(
    () => characters.slice(0, numShow),
    [characters, numShow]
  )

  const [characterKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )

  return (
    <>
      <CharacterEditor
        characterKey={characterKey}
        onClose={() => setCharacterKey(undefined)}
      />
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ widht: '100%', height: '100%', minHeight: 300 }}
          />
        }
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <CardThemed bgt="dark">
            <CardHeader title="Characters" />
          </CardThemed>
          <Grid container spacing={1} columns={columns}>
            {charactersInView.map((c, i) => (
              <Grid item key={i} xs={1}>
                <CharacterCard
                  character={c}
                  onClick={() => setCharacterKey(c.key)}
                />
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
      </Suspense>
    </>
  )
}
