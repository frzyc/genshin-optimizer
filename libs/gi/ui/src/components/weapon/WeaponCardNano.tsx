import {
  BootstrapTooltip,
  ConditionalWrapper,
} from '@genshin-optimizer/common/ui'
import { imgAssets, weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase, useWeapon } from '@genshin-optimizer/gi/db-ui'
import type { WeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat, weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { getWeaponLevelString } from '@genshin-optimizer/gi/util'
import { dataObjForWeapon, input } from '@genshin-optimizer/gi/wr'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import { Box, CardActionArea, Chip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { GetCalcDisplay, resolveInfo } from '../../util'
import { CharIconSide } from '../character'
import { WeaponNameTooltip } from './WeaponNameTooltip'

type Data = {
  weaponId?: string
  onClick?: () => void
  showLocation?: boolean
  weaponTypeKey?: WeaponTypeKey
}

export function WeaponCardNano({
  weaponId,
  showLocation = false,
  onClick,
  weaponTypeKey = 'sword',
}: Data) {
  const weapon = useWeapon(weaponId)
  const weaponSheet = weapon?.key && getWeaponSheet(weapon.key)

  if (!weapon || !weaponSheet)
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <Box
          component="img"
          src={imgAssets.weaponTypes[weaponTypeKey]}
          sx={{ width: '25%', height: 'auto', opacity: 0.7 }}
        />
      </Box>
    )

  return (
    <WeaponCardNanoObj
      weapon={weapon}
      weaponSheet={weaponSheet}
      onClick={onClick}
      showLocation={showLocation}
    />
  )
}
export function WeaponCardNanoObj({
  weapon,
  weaponSheet,
  showLocation = false,
  onClick,
}: {
  weapon: ICachedWeapon
  weaponSheet: WeaponSheet
  onClick?: () => void
  showLocation?: boolean
}) {
  const database = useDatabase()
  const { refinement, location } = weapon
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
        {children}
      </CardActionArea>
    ),
    [onClick]
  )
  const UIData = useMemo(
    () =>
      weaponSheet &&
      weapon &&
      computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
    [weaponSheet, weapon]
  )
  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <Box display="flex" height="100%" alignItems="stretch">
        <Box
          className={`grad-${getWeaponStat(weapon.key).rarity}star`}
          sx={{
            height: '100%',
            position: 'relative',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <WeaponNameTooltip weaponKey={weapon.key}>
            <Box
              component="img"
              src={weaponAsset(weapon.key, weapon.ascension >= 2)}
              sx={{ mx: -1, maxHeight: '100%', maxWidth: '100%' }}
            />
          </WeaponNameTooltip>
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              p: 0.5,
              opacity: 0.85,
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            <Chip
              size="small"
              label={
                <strong>
                  {getWeaponLevelString(weapon.level, weapon.ascension)}
                </strong>
              }
              color="primary"
            />
            {showLocation && (
              <Chip
                size="small"
                label={
                  location ? (
                    <CharIconSide
                      characterKey={database.chars.LocationToCharacterKey(
                        location
                      )}
                    />
                  ) : (
                    <BusinessCenterIcon />
                  )
                }
                color={'secondary'}
                sx={{
                  overflow: 'visible',
                  '.MuiChip-label': {
                    overflow: 'visible',
                  },
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              p: 0.5,
              opacity: 0.85,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            {weaponHasRefinement(weapon.key) && (
              <Chip
                size="small"
                color="info"
                label={<strong>R{refinement}</strong>}
              />
            )}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" sx={{ p: 1 }}>
          <WeaponStat node={UIData.get(input.weapon.main)} />
          <WeaponStat node={UIData.get(input.weapon.sub)} />
        </Box>
      </Box>
    </ConditionalWrapper>
  )
}
function WeaponStat({ node }: { node: CalcResult }) {
  const { name, icon } = resolveInfo(node.info)
  if (!name) return null
  return (
    <Box display="flex" gap={1} alignContent="center">
      <Typography
        sx={{ flexGrow: 1, display: 'flex', gap: 1 }}
        component="span"
      >
        <BootstrapTooltip
          placement="top"
          title={<Typography>{name}</Typography>}
          disableInteractive
        >
          <span>{icon}</span>
        </BootstrapTooltip>
        <span>{GetCalcDisplay(node).valueString}</span>
      </Typography>
    </Box>
  )
}
