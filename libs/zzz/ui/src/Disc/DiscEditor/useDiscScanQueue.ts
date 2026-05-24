import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Processed } from '@genshin-optimizer/zzz/disc-scanner'
import { ScanningQueue } from '@genshin-optimizer/zzz/disc-scanner'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { linesFromImage } from './ScanningUtil'
import { playScanErrorSound } from './scanSounds'

export function useDiscScanQueue(
  onShow: () => void,
  setDiscFromScan: (disc: Partial<ICachedDisc>) => void,
  isCapturingRef: MutableRefObject<boolean>
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

  const captureIdleBlockedRef = useRef(false)
  const scanningDataRef = useRef({ processedNum: 0, outstandingNum: 0, scanningNum: 0 })

  scanningDataRef.current = { processedNum, outstandingNum, scanningNum }

  const queueTotal = processedNum + outstandingNum + scanningNum

  const isCaptureProgressIdle =
    !processedNum && !outstandingNum && !scanningNum && !captureIdleBlockedRef.current

  const shouldSkipCapture = () => {
    const { processedNum: p, outstandingNum: o, scanningNum: s } =
      scanningDataRef.current
    return !!(p || o || s || captureIdleBlockedRef.current)
  }

  const uploadFiles = useCallback(
    (files?: FileList | null) => {
      if (!files) return
      onShow()
      queue.addFiles(Array.from(files).map((f) => ({ f, fName: f.name })))
    },
    [onShow, queue]
  )

  const addCaptureFile = useCallback(
    (file: File) => {
      onShow()
      queue.addFiles([{ f: file, fName: file.name }])
    },
    [onShow, queue]
  )

  const clearQueue = useCallback(() => {
    queue.clearQueue()
  }, [queue])

  const clearCaptureIdleBlocked = useCallback(() => {
    captureIdleBlockedRef.current = false
  }, [])

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
    if (isCapturingRef.current) captureIdleBlockedRef.current = true
    if (!scannedDisc && rest.texts.length > 0) {
      playScanErrorSound()
    }
  }, [queue, processedNum, scannedData, setDiscFromScan, isCapturingRef])

  return {
    queue,
    scannedData,
    processedNum,
    outstandingNum,
    scanningNum,
    queueTotal,
    isCaptureProgressIdle,
    shouldSkipCapture,
    uploadFiles,
    addCaptureFile,
    clearQueue,
    clearCaptureIdleBlocked,
    clearScannedData,
  }
}
