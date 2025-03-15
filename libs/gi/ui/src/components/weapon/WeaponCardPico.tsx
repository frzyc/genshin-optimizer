import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useWeapon } from '@genshin-optimizer/gi/db-ui'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat, weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { getLevelString } from '@genshin-optimizer/gi/util'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { GetCalcDisplay, resolveInfo } from '../../util'
import { WeaponNameTooltip } from './WeaponNameTooltip'

export function WeaponCardPico({ weaponId }: { weaponId: string }) {
  const weapon = useWeapon(weaponId)
  if (!weapon) return null
  return <WeaponCardPicoObj weapon={weapon} />
}

export function WeaponCardPicoObj({ weapon }: { weapon: ICachedWeapon }) {
  const weaponSheet = weapon?.key && getWeaponSheet(weapon.key)
  const UIData = useMemo(
    () =>
      weaponSheet &&
      weapon &&
      computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
    [weaponSheet, weapon],
  )
  if (!weapon || !weaponSheet || !UIData) return null

  const tooltipAddl = (
    <Box>
      <WeaponStatPico node={UIData.get(input.weapon.main)} />
      <WeaponStatPico node={UIData.get(input.weapon.sub)} />
    </Box>
  )

  return (
    <CardThemed
      sx={{
        height: '100%',
        maxWidth: 128,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignContent="flex-end"
        className={`grad-${getWeaponStat(weapon.key).rarity}star`}
      >
        <WeaponNameTooltip weaponKey={weapon.key} addlText={tooltipAddl}>
          <Box
            component={NextImage ? NextImage : 'img'}
            src={weaponAsset(weapon.key, weapon.ascension >= 2)}
            maxWidth="100%"
            maxHeight="100%"
            sx={{ mt: 'auto' }}
          />
        </WeaponNameTooltip>
      </Box>
      <Typography
        sx={{
          position: 'absolute',
          fontSize: '0.75rem',
          lineHeight: 1,
          opacity: 0.85,
          pointerEvents: 'none',
          p: 0.25,
        }}
      >
        <strong>{getLevelString(weapon.level, weapon.ascension)}</strong>
      </Typography>
      {weaponHasRefinement(weapon.key) && (
        <Typography
          sx={{
            position: 'absolute',
            fontSize: '0.75rem',
            lineHeight: 1,
            opacity: 0.85,
            pointerEvents: 'none',
            bottom: 0,
            right: 0,
            p: 0.25,
          }}
        >
          <strong>R{weapon.refinement}</strong>
        </Typography>
      )}
    </CardThemed>
  )
}
function WeaponStatPico({ node }: { node: CalcResult }) {
  const { icon } = resolveInfo(node.info)
  return (
    <Typography>
      {icon} {GetCalcDisplay(node).valueString}
    </Typography>
  )
}
