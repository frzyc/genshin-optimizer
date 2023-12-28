import type { Processed } from '@genshin-optimizer/gi-art-scanner'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/ui-common'
import HelpIcon from '@mui/icons-material/Help'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  styled,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { Suspense, useState } from 'react'
// a dummy input for file
const InputInvis = styled('input')({
  display: 'none',
})
export function ScanDisplay({
  scannedData,
  processedNum,
  outstandingNum,
  scanningNum,
  onUpload,
  onClearQueue,
}: {
  scannedData?: Omit<Processed, 'artifact'>
  processedNum: number
  outstandingNum: number
  scanningNum: number
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onClearQueue: () => void
}) {
  const { fileName, imageURL, debugImgs } = scannedData ?? {}

  const queueTotal = processedNum + outstandingNum + scanningNum
  return (
    <CardThemed bgt="light">
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Suspense fallback={<Skeleton width="100%" height="100" />}>
          <Box display="flex" justifyContent="space-between">
            <label htmlFor="contained-button-file">
              <InputInvis
                accept="image/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={onUpload}
              />
              <Button component="span" startIcon={<PhotoCameraIcon />}>
                Upload Screenshot (or Ctrl-V)
              </Button>
            </label>
            <Button
              color="info"
              sx={{ px: 2, minWidth: 0 }}
              // onClick={() => setModalShow(true)} //TODO:
            >
              <HelpIcon />
            </Button>
          </Box>
          {imageURL && (
            <Box display="flex" justifyContent="center">
              <Box
                component="img"
                src={imageURL}
                width="100%"
                maxWidth={350}
                height="auto"
                alt={fileName || 'Screenshot to parse for artifact values'}
              />
            </Box>
          )}
          {process.env.NODE_ENV === 'development' && debugImgs && (
            <Box>
              <DebugModal imgs={debugImgs} />
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
            <CardThemed sx={{ pl: 1 }}>
              <Box display="flex" alignItems="center">
                {queueTotal && <CircularProgress size="1.5em" />}
                <Typography sx={{ flexGrow: 1, ml: 1 }}>
                  <span>
                    Screenshots in file-queue:
                    <b>{queueTotal}</b>
                    {/* {process.env.NODE_ENV === "development" && ` (Debug: Processed ${processed.length}/${maxProcessedCount}, Processing: ${outstanding.filter(entry => entry.result).length}/${maxProcessingCount}, Outstanding: ${outstanding.length})`} */}
                  </span>
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

function DebugModal({ imgs }: { imgs: Record<string, string> }) {
  const [show, setshow] = useState(false)
  const onOpen = () => setshow(true)
  const onClose = () => setshow(false)
  return (
    <>
      <Button color="warning" onClick={onOpen}>
        DEBUG
      </Button>
      <ModalWrapper open={show} onClose={onClose}>
        <CardThemed>
          <CardContent>
            <Stack spacing={1}>
              {Object.entries(imgs).map(([key, url]) => (
                <Box key={key}>
                  <Typography>{key}</Typography>
                  <Box component="img" src={url} maxWidth="100%" />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

export function ScannedTextCard({ texts }: { texts: Processed['texts'] }) {
  return (
    <CardThemed bgt="light">
      <CardContent>
        <div>{texts.slotKey}</div>
        <div>{texts.mainStatKey}</div>
        <div>{texts.mainStatVal}</div>
        <div>{texts.rarity}</div>
        <div>{texts.level}</div>
        <div>{texts.lock}</div>
        <div>{texts.substats}</div>
        <div>{texts.setKey}</div>
        <div>{texts.location}</div>
      </CardContent>
    </CardThemed>
  )
}
