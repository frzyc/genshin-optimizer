import {
  GetUserDocument,
  useAddGenshinUserMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import { CardThemed } from '@genshin-optimizer/ui-common'
import LoadingButton from '@mui/lab/LoadingButton'

import { CardContent, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
export default function UIDForm({ userId }: { userId: string }) {
  const [uid, setUid] = useState('')
  const [addGenshinUserMutation, { loading }] = useAddGenshinUserMutation({
    variables: {
      uid,
    },
    update(cache, { data }) {
      console.log('update', { cache, data })
      if (!data?.addGenshinUser.success) return
      const newGenshinUser = data.addGenshinUser.genshinUser
      if (!newGenshinUser) return
      cache.updateQuery(
        {
          query: GetUserDocument,
          variables: {
            userId,
          },
        },
        ({ getUserById }) => {
          const genshinUsers = getUserById.genshinUsers
          return {
            getUserById: {
              ...getUserById,
              genshinUsers: genshinUsers
                ? [...genshinUsers, newGenshinUser]
                : [newGenshinUser],
            },
          }
        }
      )
    },
  })
  const onSubmit = async () => {
    if (!uid) return
    addGenshinUserMutation()
  }
  // TODO: validate UID with enka?
  // TODO: print out errors from data.createUsername.error
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={2}>
          <Typography>Add a UID</Typography>
          <TextField
            placeholder="Enter UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={onSubmit}
            disabled={!uid}
          >
            Submit
          </LoadingButton>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
