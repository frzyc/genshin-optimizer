import { CardThemed } from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { OcrTextLine } from '@genshin-optimizer/zzz/disc-scanner'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopIcon from '@mui/icons-material/Stop'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material'
import { styled } from '@mui/system'
import type { ChangeEvent } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScanDebugModal } from './ScanDebugModal'
import { ScanImagePreview } from './ScanImagePreview'
import { ScanInfoModal } from './ScanInfoModal'
import type { CapturePhase } from './useGameCapture'
import { CAPTURE_INTERVAL_MS } from './useGameCapture'

const InputInvis = styled('input')({
  display: 'none',
})

function useCaptureCountdown(deadlineAt: number) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [deadlineAt])

  const msLeft = Math.max(0, deadlineAt - now)
  return {
    progress: Math.min(100, 100 * (1 - msLeft / CAPTURE_INTERVAL_MS)),
    secondsLeft: Math.ceil(msLeft / 1000),
  }
}

function CaptureCountdownAlert({
  deadlineAt,
  hint,
}: {
  deadlineAt: number
  hint: string
}) {
  const { progress, secondsLeft } = useCaptureCountdown(deadlineAt)

  return (
    <Alert severity="info" sx={{ mt: 1 }}>
      <Typography sx={{ mb: 1 }}>{hint}</Typography>
      <LinearProgress variant="determinate" value={progress} />
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
        Next capture in {secondsLeft}s
      </Typography>
    </Alert>
  )
}

function CapturePausedAlert({
  hint,
  pausedHint,
}: {
  hint: string
  pausedHint: string
}) {
  return (
    <Alert severity="info" sx={{ mt: 1 }}>
      <Typography sx={{ mb: 1 }}>{hint}</Typography>
      <LinearProgress />
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
        {pausedHint}
      </Typography>
    </Alert>
  )
}

export type DiscScanPanelProps = {
  uploadLabel: string
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void
  capturePhase: CapturePhase | null
  captureDeadlineAt: number | null
  onToggleCapture: () => void
  preview?: {
    fileName?: string
    imageURL: string
    imageWidth: number
    imageHeight: number
    ocrLines: OcrTextLine[]
    debugImgs?: Record<string, string>
  }
  queueTotal: number
  processedNum: number
  scanningNum: number
  onClearQueue: () => void
}

export function DiscScanPanel({
  uploadLabel,
  onUpload,
  capturePhase,
  captureDeadlineAt,
  onToggleCapture,
  preview,
  queueTotal,
  processedNum,
  scanningNum,
  onClearQueue,
}: DiscScanPanelProps) {
  const { t } = useTranslation('disc')
  const isCapturing = capturePhase !== null

  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Suspense fallback={<Skeleton width="100%" height={100} />}>
          <Grid container spacing={1} alignItems="center">
            <Grid item flexGrow={1}>
              <label htmlFor="disc-scan-file-input">
                <InputInvis
                  accept="image/*"
                  id="disc-scan-file-input"
                  multiple
                  type="file"
                  onChange={onUpload}
                />
                <Button component="span" startIcon={<PhotoCameraIcon />}>
                  {uploadLabel}
                </Button>
              </label>
            </Grid>
            <Grid item>
              <Button
                onClick={onToggleCapture}
                startIcon={isCapturing ? <StopIcon /> : <ScreenShareIcon />}
                color={isCapturing ? 'error' : 'primary'}
                variant="contained"
              >
                {isCapturing ? 'Stop Capture' : 'Capture Screen'}
              </Button>
            </Grid>
            {shouldShowDevComponents && preview?.debugImgs && (
              <Grid item>
                <ScanDebugModal imgs={preview.debugImgs} />
              </Grid>
            )}
            <Grid item>
              <ScanInfoModal />
            </Grid>
          </Grid>

          {isCapturing &&
            (capturePhase === 'countdown' && captureDeadlineAt !== null ? (
              <CaptureCountdownAlert
                deadlineAt={captureDeadlineAt}
                hint={t('editor.captureActiveHint')}
              />
            ) : (
              <CapturePausedAlert
                hint={t('editor.captureActiveHint')}
                pausedHint={t('editor.capturePausedInvalid')}
              />
            ))}

          {preview?.imageURL && (
            <Box width="100%">
              <ScanImagePreview
                imageURL={preview.imageURL}
                imageWidth={preview.imageWidth}
                imageHeight={preview.imageHeight}
                ocrLines={preview.ocrLines}
                alt={preview.fileName || 'Screenshot to parse for disc values'}
              />
            </Box>
          )}

          {!!queueTotal && (
            <LinearProgress
              variant="buffer"
              value={(100 * processedNum) / queueTotal}
              valueBuffer={(100 * (processedNum + scanningNum)) / queueTotal}
            />
          )}

          {!!queueTotal && (
            <CardThemed sx={{ pl: 2 }}>
              <Box display="flex" alignItems="center">
                {!!scanningNum && <CircularProgress size="1em" />}
                <Typography sx={{ flexGrow: 1, ml: 1 }}>
                  Screenshots in file-queue: <b>{queueTotal}</b>
                </Typography>
                <Button size="small" color="error" onClick={onClearQueue}>
                  Clear file-queue
                </Button>
              </Box>
            </CardThemed>
          )}
        </Suspense>
      </CardContent>
    </CardThemed>
  )
}
