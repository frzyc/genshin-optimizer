'use client'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  CharacterContext,
  useDatabaseContext,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import {
  CharacterEditor,
  CompactDiscCard,
  CompactWengineCard,
} from '@genshin-optimizer/zzz/ui'
import { Box, Grid } from '@mui/material'
import { Suspense, useContext, useState } from 'react'

const columns = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 2,
  xl: 3,
} as const

export function OptimizeEquippedGrid() {
  const { database } = useDatabaseContext()
  const character = useContext(CharacterContext)
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )
  const discs = useDiscs(character?.equippedDiscs)
  const wengine = useWengine(character?.equippedWengine)

  return (
    <Box>
      <Suspense fallback={false}>
        <CharacterEditor
          characterKey={editorKey}
          onClose={() => setCharacterKey(undefined)}
        />
      </Suspense>
      <Grid
        item
        columns={columns}
        container
        spacing={2.5}
        sx={{ pt: '8px', pb: '20px', flexDirection: 'row' }}
      >
        <Grid item xs={1} key={wengine?.id}>
          {wengine &&
          wengine.id &&
          database.wengines.keys.includes(wengine.id) ? (
            <CompactWengineCard
              wengineId={wengine.id}
              onClick={() => character?.key && setCharacterKey(character.key)}
            />
          ) : (
            'No Wengine'
          )}
        </Grid>
        <Grid item xs={1}>
          Sets
        </Grid>
      </Grid>
      <Grid item columns={columns} container spacing={2.5}>
        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid item xs={1} key={disc?.id || slotKey}>
              {disc?.id && database.discs.keys.includes(disc.id) ? (
                <CompactDiscCard
                  disc={disc}
                  onClick={() =>
                    character?.key && setCharacterKey(character.key)
                  }
                />
              ) : (
                'No disc'
              )}
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}
