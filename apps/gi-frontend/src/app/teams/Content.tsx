'use client'
import { Button, Container, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useState } from 'react'
import { useSupabase } from '../../utils/supabase/client'
import { TeamCard } from './TeamCard'
import type { Teams } from './getTeams'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
// const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 }

export default function Content({
  teams: serverTeams,
  accountId,
}: {
  teams: Teams
  accountId: string
}) {
  const supabase = useSupabase()
  const [teams, setTeams] = useState(serverTeams)
  const addTeam = async () => {
    try {
      const { error } = await supabase.from('teams').insert({
        account_id: accountId,
      } as any)
      if (error) console.error(error)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    const channel = supabase
      .channel('team updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          if (payload.new) setTeams((teams) => [...teams, payload.new] as Teams)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  })
  return (
    <Container>
      <Button onClick={addTeam}> Add Team</Button>
      <Typography>Teams</Typography>

      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {teams.map((team) => (
            <Grid item key={team.id} xs={1}>
              <TeamCard team={team} />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Container>
  )
}
