import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useWeapon } from '@genshin-optimizer/gi/db-ui'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { getWeaponSheet } from '../../Data/Weapons'
import WeaponSheet from '../../Data/Weapons/WeaponSheet'
import { uiInput as input } from '../../Formula'
import { computeUIData, dataObjForWeapon } from '../../Formula/api'
import type { NodeDisplay } from '../../Formula/uiData'
import { nodeVStr } from '../../Formula/uiData'
import CardDark from '../Card/CardDark'
import SqBadge from '../SqBadge'
import WeaponNameTooltip from './WeaponNameTooltip'

export default function WeaponCardPico({ weaponId }: { weaponId: string }) {
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
    <CardDark
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
        className={`grad-${weaponSheet.rarity}star`}
      >
        <WeaponNameTooltip sheet={weaponSheet} addlText={tooltipAddl}>
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
            {WeaponSheet.getLevelString(weapon)}
          </SqBadge>
        </strong>
      </Typography>
      {weaponSheet.hasRefinement && (
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
    </CardDark>
  )
}
function WeaponStatPico({ node }: { node: NodeDisplay }) {
  return (
    <Typography>
      {node.info.icon} {nodeVStr(node)}
    </Typography>
  )
}
