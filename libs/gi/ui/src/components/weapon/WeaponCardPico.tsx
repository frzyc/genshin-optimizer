import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useWeapon } from '@genshin-optimizer/gi/db-ui'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat, weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import type { NodeDisplay } from '@genshin-optimizer/gi/uidata'
import {
  computeUIData,
  nodeVStr,
  resolveInfo,
} from '@genshin-optimizer/gi/uidata'
import { getLevelString } from '@genshin-optimizer/gi/util'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
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
    [weaponSheet, weapon]
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
            component="img"
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
        }}
      >
        <strong>
          <SqBadge color="primary">
            {getLevelString(weapon.level, weapon.ascension)}
          </SqBadge>
        </strong>
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
          }}
        >
          <strong>
            <SqBadge color="secondary">R{weapon.refinement}</SqBadge>
          </strong>
        </Typography>
      )}
    </CardThemed>
  )
}
function WeaponStatPico({ node }: { node: NodeDisplay }) {
  const { icon } = resolveInfo(node.info)
  return (
    <Typography>
      {icon} {nodeVStr(node)}
    </Typography>
  )
}
