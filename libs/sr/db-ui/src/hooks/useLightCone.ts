import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { useDatabaseContext } from '../context'

export function useLightCone(lightConeId: string | undefined) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.lightCones, lightConeId ?? '')
}
