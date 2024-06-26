'use client'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { Tables } from '@genshin-optimizer/gi/supabase'
import { ArtifactCardObj } from '@genshin-optimizer/gi/ui'
import { randomizeArtifact } from '@genshin-optimizer/gi/util'
import { Button, Container, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useState } from 'react'
import { useSupabase } from '../../utils/supabase/client'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
// const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 }

export default function Content({
  artifacts: serverArtifacts,
  accountId,
}: {
  artifacts: Array<Tables<'artifacts'>>
  accountId: string
}) {
  const supabase = useSupabase()
  const [artifacts, setArtifacts] = useState(serverArtifacts)
  const addArtifact = async () => {
    try {
      const { error } = await supabase.from('artifacts').insert({
        ...randomizeArtifact(),
        account: accountId,
      } as any)
      if (error) console.error(error)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    const channel = supabase
      .channel('artifact updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artifacts',
          filter: `account=eq.${accountId}`,
        },
        (payload) => {
          if (payload.new)
            setArtifacts(
              (arts) => [...arts, payload.new] as Array<Tables<'artifacts'>>
            )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  })
  return (
    <Container>
      <Button onClick={addArtifact}> Add Artifact</Button>
      <Typography>Artifacts</Typography>

      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {artifacts.map((art) => (
            <Grid item key={art.id} xs={1}>
              <ArtifactCardObj
                artifact={art as unknown as ICachedArtifact}
                // effFilter={effFilterSet}
                // onDelete={() => database.arts.remove(artId)}
                // onEdit={() => setArtifactIdToEdit(artId)}
                // setLocation={(location) =>
                //   database.arts.set(artId, { location })
                // }
                // onLockToggle={() =>
                //   database.arts.set(artId, ({ lock }) => ({ lock: !lock }))
                // }
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Container>
  )
}
