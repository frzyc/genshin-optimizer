import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { captureFrameFromStream } from './captureFrame'
import { playCaptureShutterSound } from './scanSounds'

export const CAPTURE_INTERVAL_MS = 5000

export function useScreenCapture(
  onShow: () => void,
  onFrameCaptured: (file: File) => void,
  /** Skip interval tick while queue is busy or awaiting dup/upgrade handling. */
  shouldSkipCapture: () => boolean,
  /** Show countdown progress (vs indeterminate “waiting for scan”). */
  isProgressIdle: () => boolean,
  isCapturingRef: MutableRefObject<boolean>
) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureProgress, setCaptureProgress] = useState(0)

  const captureStreamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const captureGenerationRef = useRef(0)
  const captureCycleStartRef = useRef(Date.now())
  const captureProgressRafRef = useRef<number | null>(null)

  const shouldSkipCaptureRef = useRef(shouldSkipCapture)
  shouldSkipCaptureRef.current = shouldSkipCapture
  const isProgressIdleRef = useRef(isProgressIdle)
  isProgressIdleRef.current = isProgressIdle

  const isGenerationActive = useCallback(
    (generation: number) => generation === captureGenerationRef.current,
    []
  )

  const resetCaptureCycle = useCallback(() => {
    captureCycleStartRef.current = Date.now()
    setCaptureProgress(0)
  }, [])

  const stopCapture = useCallback(() => {
    captureGenerationRef.current += 1

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }

    if (captureProgressRafRef.current !== null) {
      cancelAnimationFrame(captureProgressRafRef.current)
      captureProgressRafRef.current = null
    }

    const stream = captureStreamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    captureStreamRef.current = null
    setIsCapturing(false)
    setCaptureProgress(0)
  }, [])

  const captureFrame = useCallback(
    async (stream: MediaStream | null, generation: number) => {
      if (!stream || !isGenerationActive(generation)) return
      try {
        const file = await captureFrameFromStream(stream, () =>
          isGenerationActive(generation)
        )
        if (!file || !isGenerationActive(generation)) return
        playCaptureShutterSound()
        onFrameCaptured(file)
        resetCaptureCycle()
      } catch (error) {
        console.error('Failed to capture screenshot:', error)
      }
    },
    [isGenerationActive, onFrameCaptured, resetCaptureCycle]
  )

  const startCapture = useCallback(async () => {
    try {
      stopCapture()

      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert(
          'Screen capture is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.'
        )
        return
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })

      captureStreamRef.current = stream
      setIsCapturing(true)
      onShow()
      resetCaptureCycle()

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.addEventListener('ended', stopCapture, { once: true })
      }

      const generation = captureGenerationRef.current
      captureIntervalRef.current = setInterval(() => {
        if (!isGenerationActive(generation)) return
        if (shouldSkipCaptureRef.current()) return
        void captureFrame(captureStreamRef.current, generation)
      }, CAPTURE_INTERVAL_MS)
    } catch (error) {
      console.error('Failed to start screen capture:', error)
      stopCapture()
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert(
          'Screen capture permission was denied. Please allow screen sharing to use this feature.'
        )
      } else {
        alert(
          'Failed to start screen capture. Please ensure you grant permission to share your screen.'
        )
      }
    }
  }, [captureFrame, isGenerationActive, onShow, resetCaptureCycle, stopCapture])

  useEffect(() => {
    if (!isCapturing) return

    const tick = () => {
      if (isProgressIdleRef.current()) {
        const elapsed = Date.now() - captureCycleStartRef.current
        setCaptureProgress(Math.min(100, (elapsed / CAPTURE_INTERVAL_MS) * 100))
      } else {
        setCaptureProgress(0)
        captureCycleStartRef.current = Date.now()
      }
      captureProgressRafRef.current = requestAnimationFrame(tick)
    }

    captureProgressRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (captureProgressRafRef.current !== null) {
        cancelAnimationFrame(captureProgressRafRef.current)
        captureProgressRafRef.current = null
      }
    }
  }, [isCapturing])

  useEffect(() => {
    isCapturingRef.current = isCapturing
  }, [isCapturing, isCapturingRef])

  useEffect(() => () => stopCapture(), [stopCapture])

  return {
    isCapturing,
    captureProgress,
    startCapture,
    stopCapture,
  }
}
