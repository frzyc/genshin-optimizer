import { ImgIcon } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { StatDisplay, WengineName, ZCard } from '@genshin-optimizer/zzz/ui'
import type { IWengine } from '@genshin-optimizer/zzz/zood'
import { Box, CardContent, CardHeader, Stack, Typography } from '@mui/material'
import { wengineUiSheets } from '../sheets'

export function WengineSheetDisplay({
  headerAction,
  fade = false,
  wengine,
}: {
  headerAction?: React.ReactNode
  fade?: boolean
  wengine: IWengine
}) {
  const { key: wengineKey, level, phase, modification } = wengine
  const wengineSheet = wengineUiSheets[wengineKey]
  const wengineStats = getWengineStats(wengineKey, level, phase, modification)
  const mainStatKey = 'atk_base'
  const substatKey = getWengineStat(wengineKey)['second_statkey']
  if (!wengineSheet) return null
  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<WengineName wKey={wengineKey} />}
        avatar={<ImgIcon src={wengineAsset(wengineKey, 'icon')} size={2} />}
        action={headerAction}
      />
      <CardContent sx={{ py: 0 }}>
        <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <StatDisplay statKey={'atk'} />
          <span>
            {toPercent(wengineStats[mainStatKey], mainStatKey).toFixed(
              statKeyToFixed(mainStatKey)
            )}
            {getUnitStr(mainStatKey)}
          </span>
        </Typography>
        <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <StatDisplay statKey={substatKey} />
          <span>
            {toPercent(wengineStats[substatKey], substatKey).toFixed(
              statKeyToFixed(substatKey)
            )}
            {getUnitStr(substatKey)}
          </span>
        </Typography>
      </CardContent>
      <Box sx={{ opacity: fade ? 0.5 : 1 }}>
        <WengineUiSheetElement uiSheetElement={wengineSheet} />
      </Box>
    </ZCard>
  )
}

function WengineUiSheetElement({
  uiSheetElement,
}: {
  uiSheetElement: UISheetElement
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
            collapse
          />
        ))}
      </Stack>
    </CardContent>
  )
}
