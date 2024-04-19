'use client'
import {
  GenshinUserDataWrapper,
  UserDataWrapper,
} from '@genshin-optimizer/gi/ui-next'
import type { ReactNode } from 'react'

export default function DataWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <UserDataWrapper>
        <GenshinUserDataWrapper>{children}</GenshinUserDataWrapper>
      </UserDataWrapper>
    </>
  )
}
