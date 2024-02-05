'use client'
import type {
  Artifact,
  Character,
  Weapon,
} from '@genshin-optimizer/gi/frontend-gql'
import { useGetAllDataLazyQuery } from '@genshin-optimizer/gi/frontend-gql'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { UserContext } from './UserDataWrapper'
import type { ApolloError } from '@apollo/client'

export type GenshinUserDataObj = {
  artifacts?: Artifact[]
  characters?: Character[]
  weapons?: Weapon[]
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
    genshinUserId && getAllData()
  }, [getAllData, genshinUserId])
  if (error) console.error(error)
  const value = useMemo(() => {
    if (!data)
      return {
        ...defaultGenshinUserDataObj,
        loading,
        error,
      }
    const ret: GenshinUserDataObj = {
      // we are casting these data for convenience.
      //`genshinUserId` prop should not be used in logic at all
      artifacts: data.getAllUserArtifact as Artifact[],
      weapons: data.getAllUserWeapon as Weapon[],
      characters: data.getAllUserCharacter as Character[],
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
