'use client'
import type { ReactNode } from 'react'
import {
  GenshinUserDataWrapper,
  UserDataWrapper,
} from '@genshin-optimizer/gi_ui-next'

export default function DataWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <UserDataWrapper>
        <GenshinUserDataWrapper>{children}</GenshinUserDataWrapper>
      </UserDataWrapper>
    </>
  )
}
