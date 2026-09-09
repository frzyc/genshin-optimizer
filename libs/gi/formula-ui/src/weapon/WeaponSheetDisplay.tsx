import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import {
  WeaponName,
  WeaponPassiveDesc,
  WeaponPassiveName,
} from '@genshin-optimizer/gi/ui'
import { Box, CardContent, CardHeader, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { pandoCardSx } from '../pandoCardSx'
import { weaponUiSheets } from './weaponUiSheets'

export function WeaponSheetDisplay({
  headerAction,
  fade = false,
  weapon,
}: {
  headerAction?: ReactNode
  fade?: boolean
  weapon: IWeapon
}) {
  const { key: weaponKey, level, ascension, refinement } = weapon
  const weaponSheet = weaponUiSheets[weaponKey]
  if (!weaponSheet) return null
  const showPassive = weaponHasRefinement(weaponKey)
  return (
    <CardThemed bgt="light" sx={{ height: '100%', ...pandoCardSx }}>
      <CardHeader
        title={<WeaponName weaponKey={weaponKey} />}
        avatar={
          <ImgIcon src={weaponAsset(weaponKey, ascension >= 2)} size={2} />
        }
        action={headerAction}
        titleTypographyProps={{ variant: 'subtitle1' }}
        subheader={`Lv. ${level}${showPassive ? ` R${refinement}` : ''}`}
      />
      <Box sx={{ opacity: fade ? 0.5 : 1 }}>
        {showPassive && (
          <CardContent>
            <Typography variant="subtitle1">
              <WeaponPassiveName weaponKey={weaponKey} />
            </Typography>
            <WeaponPassiveDesc
              weaponKey={weaponKey}
              refineIndex={refinement - 1}
            />
          </CardContent>
        )}
        <WeaponUiSheetElement uiSheetElement={weaponSheet} />
      </Box>
    </CardThemed>
  )
}

function WeaponUiSheetElement({
  uiSheetElement,
}: {
  uiSheetElement: UISheetElement
}) {
  const { documents } = uiSheetElement
  if (!documents.length) return null
  return (
    <CardContent>
      <Stack spacing={1}>
        {documents.map((doc, i) => (
          <DocumentDisplay
            key={doc.type === 'conditional' ? doc.conditional.metadata.name : i}
            document={doc}
            typoVariant="body2"
            collapse
          />
        ))}
      </Stack>
    </CardContent>
  )
}
