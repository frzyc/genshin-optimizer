import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import { type WengineKey } from '@genshin-optimizer/zzz/consts'
import { WengineName } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { wengineUiSheets } from '../sheets'

export function WengineSheetDisplay({ wkey }: { wkey: WengineKey }) {
  const wengineSheet = wengineUiSheets[wkey]
  if (!wengineSheet) return null
  return (
    <CardThemed>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box
            component={NextImage ? NextImage : 'img'}
            alt="Wengine Cover Image"
            src={wengineAsset(wkey, 'big')}
            sx={{
              maxHeight: '5em',
              width: 'auto',
            }}
          />
          <Typography variant="h6">
            <WengineName wKey={wkey} />
          </Typography>
        </Box>
        <WengineUiSheetElement uiSheetElement={wengineSheet} />
      </CardContent>
    </CardThemed>
  )
}

function WengineUiSheetElement({
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
