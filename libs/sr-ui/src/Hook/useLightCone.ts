import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../Context'

export function useLightCone(lightConeId: string | '' | undefined = '') {
  const { database } = useContext(DatabaseContext)
  const [lightCone, setLightCone] = useState(
    database.lightCones.get(lightConeId)
  )
  useEffect(
    () => setLightCone(database.lightCones.get(lightConeId)),
    [database, lightConeId]
  )
  useEffect(
    () =>
      lightConeId
        ? database.lightCones.follow(
            lightConeId,
            (_k, r, v) => r === 'update' && setLightCone(v)
          )
        : undefined,
    [lightConeId, setLightCone, database]
  )
  return lightCone
}
