'use client'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { WeaponCardObj } from '@genshin-optimizer/gi/ui'
import { randomizeWeapon } from '@genshin-optimizer/gi/util'
import { Button, Container, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useState } from 'react'
import { useSupabase } from '../../utils/supabase/client'
import type { Weapons } from './getWeapons'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
// const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 }

export default function Content({
  weapons: serverWeapons,
  accountId,
}: {
  weapons: Weapons
  accountId: string
}) {
  const supabase = useSupabase()
  const [weapons, setWeapons] = useState(serverWeapons)
  const addWeapon = async () => {
    try {
      const randWeapon = randomizeWeapon()
      const { location, ...restWeapon } = randWeapon
      const { error } = await supabase.from('weapons').insert({
        ...restWeapon,
        account_id: accountId,
      } as any)
      if (error) console.error(error)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    const channel = supabase
      .channel('weapon updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weapons',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          if (payload.new)
            setWeapons((weapons) => [...weapons, payload.new] as Weapons)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  })
  return (
    <Container>
      <Button onClick={addWeapon}> Add Weapon</Button>
      <Typography>Weapons</Typography>

      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {weapons.map((weapon) => (
            <Grid item key={weapon.id} xs={1}>
              <WeaponCardObj weapon={weapon as unknown as ICachedWeapon} />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Container>
  )
}
