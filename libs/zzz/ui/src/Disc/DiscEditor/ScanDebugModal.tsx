import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { Box, Button, CardContent, Stack, Typography } from '@mui/material'

export function ScanDebugModal({ imgs }: { imgs: Record<string, string> }) {
  const [show, onOpen, onClose] = useBoolState()
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
