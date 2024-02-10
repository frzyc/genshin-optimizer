import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from './useDatabase'

export function useWeapon(weaponID: string | undefined = '') {
  const database = useDatabase()
  return useDataManagerBase(database.weapons, weaponID)
}
