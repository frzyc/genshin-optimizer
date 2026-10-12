import { useCallback, useEffect, useRef, useState } from 'react'
import { captureFrameFromStream } from './captureFrame'
import { playCaptureShutterSound } from './scanSounds'

export const CAPTURE_INTERVAL_MS = 5000

export type CapturePhase = 'countdown' | 'paused'
export type CycleTickResult = 'proceed' | 'pause'

export function useGameCapture({
  onShow,
  onCapture,
  queueBusy,
  onCycleTick,
}: {
  onShow: () => void
  onCapture: (file: File) => void
  queueBusy: boolean
  onCycleTick: () => CycleTickResult
}) {
  const [capturePhase, setCapturePhase] = useState<CapturePhase | null>(null)
  const [captureDeadlineAt, setCaptureDeadlineAt] = useState<number | null>(
    null
  )

  const isCapturingRef = useRef(false)
  const captureStreamRef = useRef<MediaStream | null>(null)
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const capturePhaseRef = useRef(capturePhase)
  capturePhaseRef.current = capturePhase

  const runCycleTickRef = useRef<() => Promise<void>>(async () => {})

  const onCycleTickRef = useRef(onCycleTick)
  onCycleTickRef.current = onCycleTick

  const isCapturing = capturePhase !== null

  const clearCycleTimer = useCallback(() => {
    if (cycleTimerRef.current !== null) {
      clearTimeout(cycleTimerRef.current)
      cycleTimerRef.current = null
    }
  }, [])

  const captureFrame = useCallback(
    async (stream: MediaStream | null) => {
      if (
        !stream ||
        !isCapturingRef.current ||
        captureStreamRef.current !== stream
      ) {
        return
      }
      const isSessionActive = () =>
        isCapturingRef.current && captureStreamRef.current === stream
      try {
        const file = await captureFrameFromStream(stream, isSessionActive)
        if (!file || !isSessionActive()) return
        playCaptureShutterSound()
        onCapture(file)
      } catch (error) {
        console.error('Failed to capture screenshot:', error)
      }
    },
    [onCapture]
  )

  const scheduleCycleTimer = useCallback(() => {
    clearCycleTimer()
    setCapturePhase('countdown')
    setCaptureDeadlineAt(Date.now() + CAPTURE_INTERVAL_MS)

    cycleTimerRef.current = setTimeout(() => {
      cycleTimerRef.current = null
      if (!isCapturingRef.current) return
      void runCycleTickRef.current()
    }, CAPTURE_INTERVAL_MS)
  }, [clearCycleTimer])

  const runCycleTick = useCallback(async () => {
    if (!isCapturingRef.current) return
    if (capturePhaseRef.current === 'paused') return

    if (queueBusy) {
      scheduleCycleTimer()
      return
    }

    if (onCycleTickRef.current() === 'pause') {
      clearCycleTimer()
      setCaptureDeadlineAt(null)
      setCapturePhase('paused')
      return
    }

    await captureFrame(captureStreamRef.current)
    if (!isCapturingRef.current) return
    scheduleCycleTimer()
  }, [captureFrame, clearCycleTimer, queueBusy, scheduleCycleTimer])

  runCycleTickRef.current = runCycleTick

  const stopCapture = useCallback(() => {
    isCapturingRef.current = false
    clearCycleTimer()

    const stream = captureStreamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    captureStreamRef.current = null
    setCapturePhase(null)
    setCaptureDeadlineAt(null)
  }, [clearCycleTimer])

  const startCapture = useCallback(async () => {
    try {
      stopCapture()
      isCapturingRef.current = true

      if (!navigator.mediaDevices?.getDisplayMedia) {
        isCapturingRef.current = false
        alert(
          'Screen capture is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.'
        )
        return
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })

      if (!isCapturingRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      captureStreamRef.current = stream
      onShow()
      scheduleCycleTimer()

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.addEventListener('ended', stopCapture, { once: true })
      }
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
  }, [onShow, scheduleCycleTimer, stopCapture])

  useEffect(() => () => stopCapture(), [stopCapture])

  return {
    capturePhase,
    captureDeadlineAt,
    isCapturing,
    startCapture,
    stopCapture,
    scheduleCycleTimer,
  }
}
