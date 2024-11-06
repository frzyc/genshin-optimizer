import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/pando/ui-sheet'
import { DocumentDisplay } from '@genshin-optimizer/pando/ui-sheet'
import { lightConeAsset } from '@genshin-optimizer/sr/assets'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { lightConeUiSheets } from '@genshin-optimizer/sr/formula-ui'
import { LightConeName } from '@genshin-optimizer/sr/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

export function LightConeSheetDisplay({ lcKey }: { lcKey: LightConeKey }) {
  const lcSheet = lightConeUiSheets[lcKey]
  if (!lcSheet) return null
  return (
    <CardThemed>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box
            component={NextImage ? NextImage : 'img'}
            alt="Light Cone Cover Image"
            src={lightConeAsset(lcKey, 'cover')}
            sx={{
              maxHeight: '5em',
              width: 'auto',
            }}
          />
          <Typography variant="h6">
            <LightConeName lcKey={lcKey} />
          </Typography>
        </Box>
        <LightConeUiSheetElement uiSheetElement={lcSheet} />
      </CardContent>
    </CardThemed>
  )
}
function LightConeUiSheetElement({
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
