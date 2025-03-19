'use client'
import type { User } from '@supabase/supabase-js'
import { createContext, useEffect, useState } from 'react'
import type { Account } from '../util/getAccount'
import type { Profile } from '../util/getProfile'

// Define the shape of the context value
interface UserProfileContextType {
  user: User | null
  profile: Profile | null
  account: Account | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setAccount: (account: Account | null) => void
}

// Create the initial context value
const init: UserProfileContextType = {
  user: null,
  profile: null,
  account: null,
  setUser: () => {},
  setProfile: () => {},
  setAccount: () => {},
}

// Create the context
export const UserProfileContext = createContext<UserProfileContextType>(init)

export function UserProfileContextProvider({
  children,
  user: propUser,
  profile: propProfile,
  account: propAccount,
}: {
  children: React.ReactNode
  user: User | null
  profile: Profile | null
  account: Account | null
}) {
  const [user, setUser] = useState<User | null>(propUser)
  const [profile, setProfile] = useState<Profile | null>(propProfile)
  const [account, setAccount] = useState<Account | null>(propAccount)
  useEffect(() => {
    setUser(propUser)
  }, [propUser])
  useEffect(() => {
    setProfile(propProfile)
  }, [propProfile])
  useEffect(() => {
    setAccount(propAccount)
  }, [propAccount])
  return (
    <UserProfileContext.Provider
      value={{ user, setUser, profile, setProfile, account, setAccount }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}
