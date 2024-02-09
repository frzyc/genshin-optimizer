import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

export default function useWeapon(weaponID: string | undefined = '') {
  const database = useDatabase()
  return useDataManagerBase(database.weapons, weaponID)
}
