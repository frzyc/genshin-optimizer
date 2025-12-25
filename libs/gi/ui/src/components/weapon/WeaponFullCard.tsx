import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useWeapon } from '@genshin-optimizer/gi/db-ui'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat, weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { getWeaponLevelString } from '@genshin-optimizer/gi/util'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { GetCalcDisplay, resolveInfo } from '../../util'
import { WeaponName } from './WeaponTrans'
export function WeaponFullCard({ weaponId }: { weaponId: string }) {
  const weapon = useWeapon(weaponId)
  if (!weapon) return null
  return <WeaponFullCardObj weapon={weapon} />
}
export function WeaponFullCardObj({
  weapon,
  bgt = 'normal',
}: {
  weapon: IWeapon
  bgt?: CardBackgroundColor
}) {
  const weaponSheet = weapon?.key && getWeaponSheet(weapon.key)
  const UIData = useMemo(
    () =>
      weaponSheet &&
      weapon &&
      computeUIData([
        weaponSheet.data,
        dataObjForWeapon(weapon as ICachedWeapon),
      ]),
    [weaponSheet, weapon]
  )
  if (!weapon || !weaponSheet || !UIData) return null
  return (
    <CardThemed bgt={bgt}>
      <Box display="flex">
        <Box
          flexShrink={1}
          maxWidth="35%"
          display="flex"
          flexDirection="column"
          alignContent="flex-end"
          className={`grad-${getWeaponStat(weapon.key).rarity}star`}
        >
          <Box
            component="img"
            src={weaponAsset(weapon.key, weapon.ascension >= 2)}
            width="100%"
            height="auto"
            sx={{ mt: 'auto' }}
          />
        </Box>
        <Box flexGrow={1} sx={{ p: 1 }}>
          <Typography variant="body2" gutterBottom>
            <strong>
              <WeaponName weaponKey={weapon.key} />
            </strong>
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', gap: 1 }}
            gutterBottom
          >
            <SqBadge color="primary">
              Lv. {getWeaponLevelString(weapon.level, weapon.ascension)}
            </SqBadge>
            {weaponHasRefinement(weapon.key) && (
              <SqBadge color="info">R{weapon.refinement}</SqBadge>
            )}
          </Typography>
          <Typography variant="subtitle1" sx={{ display: 'flex', gap: 1 }}>
            <WeaponStat node={UIData.get(input.weapon.main)} />
            <WeaponStat node={UIData.get(input.weapon.sub)} />
          </Typography>
        </Box>
      </Box>
    </CardThemed>
  )
}
function WeaponStat({ node }: { node: CalcResult }) {
  const { icon } = resolveInfo(node.info)
  return Number.isNaN(node.value) ? null : (
    <SqBadge color="secondary">
      {icon} {GetCalcDisplay(node).valueString}
    </SqBadge>
  )
}
