'use client'
import type { Tables } from '@genshin-optimizer/gi/supabase'
import { randomizeCharacter } from '@genshin-optimizer/gi/util'
import { Button, Container, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useState } from 'react'
import { useSupabase } from '../../utils/supabase/client'
import { CharacterCard } from './CharacterCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
// const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 }

export default function Content({
  characters: serverCharacters,
  accountId,
}: {
  characters: Array<Tables<'characters'>>
  accountId: string
}) {
  const supabase = useSupabase()
  const [characters, setCharacters] = useState(serverCharacters)
  const addChar = async () => {
    try {
      const ranChar: any = randomizeCharacter()
      if (characters.find((c) => c.key === ranChar.key))
        return console.warn('Created a character with the same key')
      const { auto, skill, burst } = ranChar.talent
      delete ranChar.talent
      ranChar.talent_auto = auto
      ranChar.talent_skill = skill
      ranChar.talent_burst = burst

      const { error } = await supabase.from('characters').insert({
        ...ranChar,
        account_id: accountId,
      } as any)
      if (error) console.error(error)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    const channel = supabase
      .channel('character updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          if (payload.new)
            setCharacters(
              (character) =>
                [...character, payload.new] as Array<Tables<'characters'>>,
            )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  })
  return (
    <Container>
      <Button onClick={addChar}> Add Character</Button>
      <Typography>Characters</Typography>

      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {characters.map((character) => (
            <Grid item key={character.id} xs={1}>
              <CharacterCard character={character} />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Container>
  )
}
