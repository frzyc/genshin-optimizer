import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { DiscSetName, ZCard } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { discUiSheets } from '../sheets'

export function DiscSheetDisplay({
  setKey,
  fade2 = false,
  fade4 = false,
  children,
}: {
  setKey: DiscSetKey
  fade2?: boolean
  fade4?: boolean
  children?: React.ReactNode
}) {
  const discSheet = discUiSheets[setKey]
  if (!discSheet) return null
  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<DiscSetName setKey={setKey} />}
        avatar={<ImgIcon src={discDefIcon(setKey)} size={2} />}
      />
      {children}
      <Stack divider={<Divider />}>
        {Object.entries(discSheet).map(([key, uiSheetElement]) => (
          <Box
            key={key}
            sx={{
              opacity: (key === '2' ? fade2 : fade4) ? 0.5 : 1,
            }}
          >
            <DiscUiSheetElement
              uiSheetElement={uiSheetElement}
              collapse={key !== '2'}
            />
          </Box>
        ))}
      </Stack>
    </ZCard>
  )
}
function DiscUiSheetElement({
  uiSheetElement,
  collapse = false,
}: {
  uiSheetElement: UISheetElement
  collapse?: boolean
}) {
  const { documents, title } = uiSheetElement
  return (
    <CardContent>
      <Typography variant="subtitle1">{title}</Typography>
      <Stack spacing={1}>
        {documents.map((doc, i) => (
          <DocumentDisplay
            key={i}
            document={doc}
            typoVariant="body2"
            collapse={collapse}
          />
        ))}
      </Stack>
    </CardContent>
  )
}
