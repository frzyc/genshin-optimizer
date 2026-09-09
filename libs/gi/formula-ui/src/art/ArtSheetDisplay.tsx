import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { ArtifactSetName } from '@genshin-optimizer/gi/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { pandoCardSx } from '../pandoCardSx'
import { artUiSheets } from './artUiSheets'

export function ArtSheetDisplay({
  setKey,
  fade2 = false,
  fade4 = false,
  children,
}: {
  setKey: ArtifactSetKey
  fade2?: boolean
  fade4?: boolean
  children?: ReactNode
}) {
  const artSheet = artUiSheets[setKey]
  if (!artSheet) return null
  return (
    <CardThemed bgt="light" sx={{ height: '100%', ...pandoCardSx }}>
      <CardHeader
        title={<ArtifactSetName setKey={setKey} />}
        avatar={<ImgIcon src={artifactDefIcon(setKey)} size={2} />}
        titleTypographyProps={{ variant: 'subtitle1' }}
      />
      {children}
      <Stack divider={<Divider />}>
        {Object.entries(artSheet).map(([key, uiSheetElement]) =>
          uiSheetElement ? (
            <Box
              key={key}
              sx={{
                opacity:
                  key === '2'
                    ? fade2
                      ? 0.5
                      : 1
                    : key === '4' && fade4
                      ? 0.5
                      : 1,
              }}
            >
              <ArtUiSheetElement
                uiSheetElement={uiSheetElement}
                collapse={key === '4'}
              />
            </Box>
          ) : null
        )}
      </Stack>
    </CardThemed>
  )
}

function ArtUiSheetElement({
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
