import { useDataManagerBase } from '@genshin-optimizer/common_database-ui'
import { useContext } from 'react'
import { DatabaseContext } from '../Database/Database'

export default function useWeapon(weaponID: string | undefined = '') {
  const { database } = useContext(DatabaseContext)
  return useDataManagerBase(database.weapons, weaponID)
}
