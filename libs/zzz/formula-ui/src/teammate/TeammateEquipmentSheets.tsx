import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon, wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedWengine } from '@genshin-optimizer/zzz/db'
import { DiscSetName, WengineName, ZCard } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { discUiSheets } from '../disc/sheets'
import { wengineUiSheets } from '../wengine/sheets'
import {
  filterDocumentsForMainUnit,
  hasMainUnitDocuments,
} from './buffAppliesToMainUnit'

export function teammateWengineHasMainUnitBuffs(key: WengineKey): boolean {
  const wengineSheet = wengineUiSheets[key]
  if (!wengineSheet) return false
  return hasMainUnitDocuments(wengineSheet.documents)
}

export function teammateDiscHasMainUnitBuffs(
  setKey: DiscSetKey,
  count: number
): boolean {
  const discSheet = discUiSheets[setKey]
  if (!discSheet) return false
  return (
    (count >= 2 && hasMainUnitDocuments(discSheet['2']?.documents ?? [])) ||
    (count >= 4 && hasMainUnitDocuments(discSheet['4']?.documents ?? []))
  )
}

export function TeammateWengineSheetDisplay({
  wengine,
}: {
  wengine: ICachedWengine
}) {
  const wengineSheet = wengineUiSheets[wengine.key]
  if (!wengineSheet) return null

  const documents = filterDocumentsForMainUnit(wengineSheet.documents)
  if (!documents.length) return null

  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<WengineName wKey={wengine.key} />}
        avatar={<ImgIcon src={wengineAsset(wengine.key, 'icon')} size={2} />}
      />
      <Stack spacing={1} sx={{ px: 1, pb: 1 }}>
        {documents.map((document, index) => (
          <DocumentDisplay
            key={index}
            document={document}
            typoVariant="body2"
          />
        ))}
      </Stack>
    </ZCard>
  )
}

export function TeammateDiscSheetDisplay({
  setKey,
  fade2 = false,
  fade4 = false,
}: {
  setKey: DiscSetKey
  fade2?: boolean
  fade4?: boolean
}) {
  const discSheet = discUiSheets[setKey]
  if (!discSheet) return null

  const pieces = (
    [['2', fade2] as const, ['4', fade4] as const] as const
  ).flatMap(([piece, faded]) => {
    if (faded) return []
    const uiSheetElement = discSheet[piece] as UISheetElement | undefined
    if (!uiSheetElement) return []
    const documents = filterDocumentsForMainUnit(uiSheetElement.documents)
    if (!documents.length) return []
    return [{ piece, uiSheetElement, documents }]
  })

  if (!pieces.length) return null

  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<DiscSetName setKey={setKey} />}
        avatar={<ImgIcon src={discDefIcon(setKey)} size={2} />}
      />
      <Stack divider={<Divider />}>
        {pieces.map(({ piece, uiSheetElement, documents }) => (
          <Box key={piece}>
            <CardContent>
              <Typography variant="subtitle1">
                {uiSheetElement.title}
              </Typography>
              <Stack spacing={1}>
                {documents.map((document, index) => (
                  <DocumentDisplay
                    key={index}
                    document={document}
                    typoVariant="body2"
                    collapse={piece !== '2'}
                  />
                ))}
              </Stack>
            </CardContent>
          </Box>
        ))}
      </Stack>
    </ZCard>
  )
}
