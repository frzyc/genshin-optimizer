'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import type { Unpromise } from '@genshin-optimizer/common/util'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Typography,
} from '@mui/material'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useSupabase } from '../../utils/supabase/client'
import { UserProfileContext } from '../context/UserProfileContext'

export default function ProfileContent() {
  const { user, profile } = useContext(UserProfileContext)
  const supabase = useSupabase()
  const [username, setUsername] = useState<string | null>(profile?.username)

  async function updateProfile({ username }: { username: string | null }) {
    // TODO: realtime
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        username,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
    }
  }

  return (
    <Container>
      <CardThemed>
        <CardContent>
          <div className="form-widget">
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="text" value={user?.email} disabled />
            </div>
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <button
                className="button primary block"
                onClick={() => updateProfile({ username })}
              >
                {'Update'}
              </button>
            </div>
          </div>
        </CardContent>
        <Divider />
        <CardContent>
          <Accounts />
        </CardContent>
        <Divider />
        <CardContent>
          <form action="/auth/signout" method="post">
            <Button type="submit" fullWidth>
              Log out
            </Button>
          </form>
        </CardContent>
      </CardThemed>
    </Container>
  )
}
async function getAccounts(supabase: SupabaseClient, profileId: string) {
  return await supabase
    .from('accounts')
    .select(`id, created_at, uid, profile, name`)
    .eq('profile', profileId)
}
type Accounts = Unpromise<ReturnType<typeof getAccounts>>['data']
type TAccount = NonNullable<Accounts>[number]
type InputAccount = {
  name: string
  uid: string | null
  id: string | null
}
function Accounts() {
  const { profile } = useContext(UserProfileContext)
  const supabase = useSupabase()
  const [accounts, setAccounts] = useState<Accounts>(null)
  const [show, onShow, onHide] = useBoolState(false)
  const fetchAccounts = useCallback(async () => {
    try {
      const { data, error, status } = await getAccounts(supabase, profile?.id)
      if (error && status !== 406) {
        console.error(error)
        throw error
        return
      }

      if (data) {
        setAccounts(data)
      }
    } catch (error) {
      alert('Error loading user data!')
    }
  }, [profile?.id, supabase])
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const upSertAccount = useCallback(
    async ({ name, uid }: InputAccount) => {
      if (!profile) return
      try {
        const { error } = await supabase.from('accounts').upsert({
          name,
          uid,
          profile: profile?.id,
        })
        if (error) throw error
        alert('Profile updated!')
      } catch (error) {
        alert('Error updating the data!')
      } finally {
        fetchAccounts()
      }
    },
    [fetchAccounts, profile, supabase],
  )

  const updateProfile = useCallback(
    async (accountId: string) => {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: profile?.id as string,
          active_account: accountId,
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
        alert('Profile updated!')
        // TODO need to somehow refresh the profile from the server side? or optimistic update?
      } catch (error) {
        alert('Error updating the data!')
      }
    },
    [profile?.id, supabase],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography>Genshin Accounts</Typography>
      <AccountModal show={show} onHide={onHide} onUpSert={upSertAccount} />
      {accounts?.map((account) => (
        <Account
          active={account.id === profile?.active_account}
          key={account.id}
          account={account}
          onClick={() => updateProfile(account.id)}
        />
      ))}

      <Button onClick={onShow}>Add Account</Button>
    </Box>
  )
}
function AccountModal({
  show,
  onHide,
  onUpSert,
}: {
  show: boolean
  onHide: () => void
  onUpSert: (account: InputAccount) => void
}) {
  const [name, setName] = useState('')
  const [uid, setUid] = useState('')
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextFieldLazy value={name} onChange={setName} label="name" />
          <TextFieldLazy value={uid} onChange={setUid} label="UID" />
          <Button
            onClick={() =>
              onUpSert({
                name: name,
                uid: uid ? uid : null,
                id: null,
              })
            }
          >
            Add
          </Button>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function Account({
  account,
  active,
  onClick,
}: {
  account: TAccount
  active?: boolean
  onClick?: () => void
}) {
  return (
    <CardThemed
      bgt="light"
      sx={{
        border: active ? '2px solid green' : null,
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>{JSON.stringify(account)}</CardContent>
      </CardActionArea>
    </CardThemed>
  )
}
