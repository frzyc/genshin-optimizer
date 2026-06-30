import { shouldShowDevComponents } from '@genshin-optimizer/common-util'
import type { ICachedDisc } from '@genshin-optimizer/zzz-db'
import type { Processed } from '@genshin-optimizer/zzz-disc-scanner'
import { ScanningQueue } from '@genshin-optimizer/zzz-disc-scanner'
import { useCallback, useEffect, useRef, useState } from 'react'
import { linesFromImage } from './ScanningUtil'
import { playScanErrorSound } from './scanSounds'

export function useHandleScanningQueue(
  onShow: () => void,
  setDiscFromScan: (disc: Partial<ICachedDisc>) => void
) {
  const queueRef = useRef(
    new ScanningQueue(linesFromImage, shouldShowDevComponents)
  )
  const queue = queueRef.current

  const [{ processedNum, outstandingNum, scanningNum }, setScanningData] =
    useState({ processedNum: 0, outstandingNum: 0, scanningNum: 0 })
  const [scannedData, setScannedData] = useState<
    undefined | Omit<Processed, 'disc'>
  >()

  const queueTotal = processedNum + outstandingNum + scanningNum
  const queueBusy = !!(processedNum || outstandingNum || scanningNum)

  const addFiles = useCallback(
    (files: File[]) => {
      onShow()
      queue.addFiles(files.map((f) => ({ f, fName: f.name })))
    },
    [onShow, queue]
  )

  const uploadFiles = useCallback(
    (files?: FileList | null) => {
      if (!files) return
      addFiles(Array.from(files))
    },
    [addFiles]
  )

  const clearQueue = useCallback(() => {
    queue.clearQueue()
  }, [queue])

  const clearScannedData = useCallback(() => {
    setScannedData(undefined)
  }, [])

  useEffect(() => {
    queue.callback = setScanningData
    return () => {
      queue.callback = () => {}
    }
  }, [queue])

  useEffect(() => {
    if (!processedNum || scannedData) return
    const processed = queue.shiftProcessed()
    if (!processed) return
    const { disc: scannedDisc, ...rest } = processed
    setScannedData(rest)
    setDiscFromScan((scannedDisc ?? {}) as Partial<ICachedDisc>)
    if (!scannedDisc && rest.texts.length > 0) {
      playScanErrorSound()
    }
  }, [queue, processedNum, scannedData, setDiscFromScan])

  return {
    scannedData,
    processedNum,
    scanningNum,
    queueTotal,
    queueBusy,
    addFiles,
    uploadFiles,
    clearQueue,
    clearScannedData,
  }
}
