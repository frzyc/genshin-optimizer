import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { Document, UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon, wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedWengine } from '@genshin-optimizer/zzz/db'
import { DiscSetName, WengineName, ZCard } from '@genshin-optimizer/zzz/ui'
import type { TypographyProps } from '@mui/material'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { discUiSheets } from '../disc/sheets'

type DiscPieceSection = {
  piece: '2' | '4'
  documents: Document[]
}

type DocumentStackProps = {
  documents: Document[]
  typoVariant?: TypographyProps['variant']
  collapse?: boolean
}

/** Renders pre-filtered teammate wengine team-buff documents. */
export function TeammateWengineSheetDisplay({
  wengine,
  documents,
}: {
  wengine: ICachedWengine
  documents: Document[]
}) {
  if (!documents.length) return null

  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<WengineName wKey={wengine.key} />}
        avatar={<ImgIcon src={wengineAsset(wengine.key, 'icon')} size={2} />}
      />
      <Box sx={{ px: 1, pb: 1 }}>
        <FilteredDocumentStack documents={documents} typoVariant="body2" />
      </Box>
    </ZCard>
  )
}

/** Renders pre-filtered teammate disc set team-buff documents (2pc / 4pc). */
export function TeammateDiscSheetDisplay({
  setKey,
  pieces,
}: {
  setKey: DiscSetKey
  pieces: DiscPieceSection[]
}) {
  const discSheet = discUiSheets[setKey]
  if (!discSheet || !pieces.length) return null

  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<DiscSetName setKey={setKey} />}
        avatar={<ImgIcon src={discDefIcon(setKey)} size={2} />}
      />
      <Stack divider={<Divider />}>
        {pieces.flatMap(({ piece, documents }) => {
          const uiSheetElement = discSheet[piece] as UISheetElement | undefined
          if (!uiSheetElement || !documents.length) return []
          return [
            <Box key={piece}>
              <CardContent>
                <Typography variant="subtitle1">
                  {uiSheetElement.title}
                </Typography>
                <FilteredDocumentStack
                  documents={documents}
                  typoVariant="body2"
                  collapse={piece !== '2'}
                />
              </CardContent>
            </Box>,
          ]
        })}
      </Stack>
    </ZCard>
  )
}

function FilteredDocumentStack({
  documents,
  typoVariant,
  collapse,
}: DocumentStackProps) {
  // Documents are pre-filtered to teammate team buffs before rendering.
  return (
    <Stack spacing={1}>
      {documents.map((document, index) => (
        <DocumentDisplay
          key={index}
          document={document}
          typoVariant={typoVariant}
          collapse={collapse}
        />
      ))}
    </Stack>
  )
}
