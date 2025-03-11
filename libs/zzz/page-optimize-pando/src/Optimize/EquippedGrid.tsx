'use client'
import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { EquipGrid } from '@genshin-optimizer/zzz/ui'
import { useContext } from 'react'

const columns = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 2,
  xl: 3,
} as const

export function EquippedGrid({ onClick }: { onClick?: () => void }) {
  const character = useContext(CharacterContext)

  return (
    <EquipGrid
      discIds={character?.equippedDiscs}
      wengineId={character?.equippedWengine}
      columns={columns}
      onClick={onClick}
      spacing={2}
    />
  )
}
