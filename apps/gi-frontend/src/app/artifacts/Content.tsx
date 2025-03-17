'use client'
import type { ArtifactRarity } from '@genshin-optimizer/gi/consts'
import { charKeyToLocCharKey } from '@genshin-optimizer/gi/consts'
import { type ICachedArtifact, cachedArtifact } from '@genshin-optimizer/gi/db'
import { ArtifactCardObj } from '@genshin-optimizer/gi/ui'
import { randomizeArtifact } from '@genshin-optimizer/gi/util'
import { Button, Container, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useState } from 'react'
import { useSupabase } from '../../utils/supabase/client'
import { ARTIFACT_QUERY } from './artifactquery'
import { type Artifact, type Artifacts } from './getArtifacts'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
// const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 }

export default function Content({
  artifacts: serverArtifacts,
  accountId,
}: {
  artifacts: Artifacts
  accountId: string
}) {
  const supabase = useSupabase()
  const [artifacts, setArtifacts] = useState(() =>
    serverArtifacts.map(artifactToCached)
  )
  const addArtifact = async () => {
    try {
      const randArtifact = randomizeArtifact()
      const { substats, location, ...rest } = randArtifact
      const { error, data } = await supabase
        .from('artifacts')
        .insert({
          ...rest,
          account_id: accountId,
        } as any)
        .select()
      if (error) return console.error(error)
      const art = data[0]
      if (!art.id) return
      // TODO: is there a better way to add substats? this sends like 5 requests per artifact...
      substats.map(async (substat, index) => {
        if (!substat.key) return
        const { error } = await supabase.from('substats').insert({
          ...substat,
          index,
          artifact_id: art.id,
        } as any)
        if (error) return console.error(error)
      })
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
          filter: `account_id=eq.${accountId}`,
        },
        async (payload) => {
          // TODO: probably need to listen to other changes? the issue is that we are not listening to changes to substats
          if (payload.new) {
            // TODO: is there a better way to update this? doing an extra lookup seems kind of excessive, but the payload.new does not include substats.
            const { error, data: artifact } = await supabase
              .from('artifacts')
              .select(ARTIFACT_QUERY)
              .eq('id', (payload.new as Artifact).id)
              .eq('account_id', accountId)
              .maybeSingle()
            if (error) return console.error(error)
            if (!artifact) return
            setArtifacts((arts) => [...arts, artifactToCached(artifact)])
          }
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
function artifactToCached(artifact: Artifact): ICachedArtifact {
  const {
    substats,
    setKey,
    level,
    mainStatKey,
    slotKey,
    rarity,
    lock,
    character,
  } = artifact
  const { artifact: ret } = cachedArtifact(
    {
      setKey,
      mainStatKey,
      substats,
      slotKey,
      level,
      rarity: rarity as ArtifactRarity,
      lock,
      location: character ? charKeyToLocCharKey(character.key) : '',
    },
    artifact.id
  )
  return ret
}
