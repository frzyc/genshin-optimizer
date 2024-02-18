'use client'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { useGetUserQuery } from '@genshin-optimizer/gi/frontend-gql'
import { CardContent, CardHeader, Divider, Stack } from '@mui/material'
import { useSession } from 'next-auth/react'

import AddCharacterButton from './components/AddCharacterButton'
import CharacterList from './components/CharacterList'

export default function CharacterPage() {
  const { data: session } = useSession()
  const userId = session?.user.userId ?? ''
  const { data, loading, error } = useGetUserQuery({
    variables: {
      userId,
    },
  })
  if (loading) return null //TODO:suspense
  if (error) return null //TODO: error
  const user = data?.getUserById
  if (!user) return null

  const { genshinUsers } = user
  const genshinUser = (genshinUsers ?? [])[0]

  const genshinUserId = genshinUser.id

  return (
    <Stack spacing={1}>
      <CardThemed>
        <CardHeader
          title="Character Page"
          action={<AddCharacterButton genshinUserId={genshinUserId} />}
        />
        <Divider />
        <CardContent></CardContent>
      </CardThemed>
      <CharacterList genshinUserId={genshinUserId} />
    </Stack>
  )
}
