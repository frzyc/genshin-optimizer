'use client'
import type {
  Artifact,
  Character,
  Weapon,
} from '@genshin-optimizer/gi-frontend-gql'
import { useGetAllDataLazyQuery } from '@genshin-optimizer/gi-frontend-gql'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { UserContext } from './UserDataWrapper'
import type { ApolloError } from '@apollo/client'

export type GenshinUserDataObj = {
  artifacts?: Omit<Artifact, 'genshinUserId'>[]
  characters?: Omit<Character, 'genshinUserId'>[]
  weapons?: Omit<Weapon, 'genshinUserId'>[]
  loading?: boolean
  error?: ApolloError
}
const defaultGenshinUserDataObj: GenshinUserDataObj = {
  loading: false,
}
export const GenshinUserContext = createContext(defaultGenshinUserDataObj)

export function GenshinUserDataWrapper({ children }: { children: ReactNode }) {
  const { genshinUserId } = useContext(UserContext)
  const [getAllData, { data, loading, error }] = useGetAllDataLazyQuery({
    variables: {
      genshinUserId,
    },
  })
  useEffect(() => {
    getAllData()
  }, [getAllData, genshinUserId])
  const value = useMemo(() => {
    if (!data)
      return {
        ...defaultGenshinUserDataObj,
        loading,
        error,
      }
    const ret: GenshinUserDataObj = {
      artifacts: data.getAllUserArtifact,
      weapons: data.getAllUserWeapon,
      characters: data.getAllUserCharacter,
      loading,
      error,
    }
    return ret
  }, [data, loading, error])

  return (
    <GenshinUserContext.Provider value={value}>
      {children}
    </GenshinUserContext.Provider>
  )
}
