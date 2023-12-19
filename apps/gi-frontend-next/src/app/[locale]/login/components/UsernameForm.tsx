import {
  GetUserDocument,
  useCreateUsernameMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import { CardThemed } from '@genshin-optimizer/ui-common'
import LoadingButton from '@mui/lab/LoadingButton'

import { CardContent, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
export default function UsernameForm({ userId }: { userId: string }) {
  const [username, setusername] = useState('')
  const [createUsernameMutation, { loading }] = useCreateUsernameMutation({
    variables: {
      username,
    },
    update(cache, { data }) {
      if (!data?.createUsername.success) return
      cache.updateQuery(
        {
          query: GetUserDocument,
          variables: {
            userId,
          },
        },
        ({ getUserById }) => {
          return {
            getUserById: {
              ...getUserById,
              username,
            },
          }
        }
      )
    },
  })
  const onSubmit = async () => {
    if (!username) return
    createUsernameMutation()
  }
  // TODO: validate username length
  // TODO: print out errors from data.createUsername.error
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={2}>
          <Typography>Create a Username</Typography>
          <TextField
            placeholder="Enter a Username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
          />
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={onSubmit}
            disabled={!username}
          >
            Submit
          </LoadingButton>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
