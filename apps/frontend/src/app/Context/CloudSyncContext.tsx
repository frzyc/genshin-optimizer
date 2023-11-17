import { createContext, useState, useMemo } from 'react'

export type CloudSyncContextObj = {
  cloudSyncInProgress: boolean
  setCloudSyncInProgress: (s: boolean) => void
}

export const CloudSyncContext = createContext({
  cloudSyncInProgress: false,
  setCloudSyncInProgress: () => {},
} as CloudSyncContextObj)

export function useCloudSync(): CloudSyncContextObj {
  const [cloudSyncInProgress, setCloudSyncInProgress] = useState(false)
  return useMemo(
    () => ({ cloudSyncInProgress, setCloudSyncInProgress }),
    [cloudSyncInProgress]
  )
}
