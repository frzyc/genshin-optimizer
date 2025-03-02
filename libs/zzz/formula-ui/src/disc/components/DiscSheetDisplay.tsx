import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { DiscSetName } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Suspense } from 'react'
import { discUiSheets } from '../sheets'

export function DiscSheetDisplay({ setKey }: { setKey: DiscSetKey }) {
  const discSheet = discUiSheets[setKey]
  if (!discSheet) return null
  return (
    <CardThemed>
      <CardContent>
        <Suspense fallback={<Skeleton width="100%" height={'500px'} />}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              component={NextImage ? NextImage : 'img'}
              alt="Disc Piece Image"
              src={discDefIcon(setKey)}
              sx={{
                maxHeight: '5em',
                width: 'auto',
              }}
            />
            <Box>
              <Typography variant="h6">
                <DiscSetName setKey={setKey} />
              </Typography>
            </Box>
          </Box>
          <Stack spacing={1}>
            {Object.entries(discSheet).map(([key, uiSheetElement]) => (
              <DiscUiSheetElement key={key} uiSheetElement={uiSheetElement} />
            ))}
          </Stack>
        </Suspense>
      </CardContent>
    </CardThemed>
  )
}
export function DiscUiSheetElement({
  uiSheetElement,
}: {
  uiSheetElement: UISheetElement
}) {
  const { documents, title } = uiSheetElement
  return (
    <CardThemed bgt="light">
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          {documents.map((doc, i) => (
            <DocumentDisplay key={i} document={doc} />
          ))}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
