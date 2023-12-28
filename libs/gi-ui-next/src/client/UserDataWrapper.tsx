'use client'
import { useGetUserQuery } from '@genshin-optimizer/gi-frontend-gql'
import { useSession } from 'next-auth/react'
import type { ReactNode } from 'react'
import { createContext, useMemo } from 'react'

import type { ApolloError } from '@apollo/client'
import type { User } from '@genshin-optimizer/gi-frontend-gql'

export type UserDataObj = {
  user?: User
  loading?: boolean
  error?: ApolloError
  genshinUserId: string
}
export const UserContext = createContext({
  loading: false,
  genshinUserId: '',
} as UserDataObj)

export function UserDataWrapper({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user.userId ?? ''
  const { data, loading, error } = useGetUserQuery({
    variables: {
      userId,
    },
  })
  const usrData = useMemo(() => {
    const user = data?.getUserById
    let genshinUserId
    if (user) {
      const { genshinUsers } = user
      const genshinUser = (genshinUsers ?? [])[0]
      genshinUserId = genshinUser.id
    }
    return {
      user,
      loading,
      error,
      genshinUserId,
    } as UserDataObj
  }, [data, loading, error])

  return <UserContext.Provider value={usrData}>{children}</UserContext.Provider>
}
