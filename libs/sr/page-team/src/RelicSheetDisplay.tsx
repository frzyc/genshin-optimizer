import { CardThemed, NextImage, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/gameOpt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/gameOpt/sheet-ui'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { relicUiSheets } from '@genshin-optimizer/sr/formula-ui'
import { RelicSetName } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot, isCavernRelic } from '@genshin-optimizer/sr/util'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

export function RelicSheetDisplay({ setKey }: { setKey: RelicSetKey }) {
  const relicSheet = relicUiSheets[setKey]
  if (!relicSheet) return null
  return (
    <CardThemed>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box
            component={NextImage ? NextImage : 'img'}
            alt="Relic Piece Image"
            src={relicAsset(setKey, getDefaultRelicSlot(setKey))}
            sx={{
              maxHeight: '5em',
              width: 'auto',
            }}
          />
          <Box>
            <Typography variant="h6">
              <RelicSetName setKey={setKey} />
            </Typography>
            {/* TODO: translate */}
            <Typography>
              <SqBadge>{isCavernRelic(setKey) ? 'Cavern' : 'Planar'}</SqBadge>
            </Typography>
          </Box>
        </Box>
        <Stack spacing={1}>
          {Object.entries(relicSheet).map(([key, uiSheetElement]) => (
            <RelicUiSheetElement key={key} uiSheetElement={uiSheetElement} />
          ))}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
export function RelicUiSheetElement({
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
