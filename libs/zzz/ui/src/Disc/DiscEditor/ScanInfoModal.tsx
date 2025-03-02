import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import InfoIcon from '@mui/icons-material/Info'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Suspense } from 'react'
import card from './card-sc.png'
import full from './full-sc.png'
export function ScanInfoModal() {
  const [show, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button color="info" onClick={onOpen}>
        <InfoIcon />
      </Button>
      <ModalWrapper
        open={show}
        onClose={onClose}
        containerProps={{ maxWidth: 'sm' }}
      >
        <CardThemed>
          <CardHeader title="How to Scan using screenshots" />
          <Divider />
          <CardContent>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={1000} />
              }
            >
              <Stack spacing={1}>
                <Alert severity="info">
                  The on-site scanner can only scan screenshots in ENGLISH.
                </Alert>
                <Typography>
                  Take a full screenshot of your game, in the inventory view.
                  You can use <strong>Alt + Print Screen</strong> to take a
                  picture of the current window.
                </Typography>
                <Box>
                  <Box
                    component="img"
                    src={full}
                    sx={{
                      height: '300px',
                    }}
                  />
                </Box>
                <Typography>
                  If the site is unable to detect from your screenshot, you can
                  provide a cropped image. You can use the{' '}
                  <strong>Windows Snippet tool (Windows + Shift + S)</strong>.
                </Typography>
                <Box>
                  <Box
                    component="img"
                    src={card}
                    sx={{
                      height: '400px',
                    }}
                  />
                </Box>
              </Stack>
            </Suspense>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
