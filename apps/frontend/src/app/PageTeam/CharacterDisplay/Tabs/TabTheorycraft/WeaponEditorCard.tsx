import { useBoolState } from '@genshin-optimizer/common/react-util'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import type { BuildTc, ICachedWeapon } from '@genshin-optimizer/gi/db'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat, weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import { WeaponName, computeUIData } from '@genshin-optimizer/gi/ui'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import {
  Box,
  Button,
  CardHeader,
  Divider,
  ListItem,
  Stack,
} from '@mui/material'
import React, { useCallback, useContext, useMemo } from 'react'
import CardDark from '../../../../Components/Card/CardDark'
import CardLight from '../../../../Components/Card/CardLight'
import DocumentDisplay from '../../../../Components/DocumentDisplay'
import {
  FieldDisplayList,
  NodeFieldDisplay,
} from '../../../../Components/FieldDisplay'
import LevelSelect from '../../../../Components/LevelSelect'
import RefinementDropdown from '../../../../Components/RefinementDropdown'
import { DataContext } from '../../../../Context/DataContext'
import { BuildTcContext } from './BuildTcContext'
const WeaponSelectionModal = React.lazy(
  () => import('../../../../Components/Weapon/WeaponSelectionModal')
)

export function WeaponEditorCard({
  weaponTypeKey,
  disabled,
}: {
  weaponTypeKey: WeaponTypeKey
  disabled: boolean
}) {
  const { buildTc, setBuildTc: setCharTC } = useContext(BuildTcContext)
  const setWeapon = useCallback(
    (weapon: Partial<BuildTc['weapon']>) => {
      setCharTC((charTC) => {
        charTC.weapon = { ...charTC.weapon, ...weapon }
      })
    },
    [setCharTC]
  )
  const weapon: ICachedWeapon = useMemo(
    () => ({
      ...buildTc.weapon,
      location: '',
      lock: false,
      id: '',
    }),
    [buildTc]
  )
  const { key, level = 0, refinement = 1, ascension = 0 } = weapon
  const weaponSheet = getWeaponSheet(key)
  const [show, onShow, onHide] = useBoolState()
  const { data } = useContext(DataContext)
  const weaponUIData = useMemo(
    () => weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
    [weaponSheet, weapon]
  )
  const hasRefinement = weaponHasRefinement(weapon.key)
  return (
    <CardLight sx={{ p: 1, mb: 1 }}>
      <WeaponSelectionModal
        ascension={ascension}
        show={show}
        onHide={onHide}
        onSelect={(k) => setWeapon({ key: k })}
        weaponTypeFilter={weaponTypeKey}
      />
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" gap={1}>
          <Box
            className={`grad-${getWeaponStat(weapon.key).rarity}star`}
            component="img"
            src={weaponAsset(weapon.key, ascension >= 2)}
            sx={{
              flexshrink: 1,
              flexBasis: 0,
              maxWidth: '30%',
              borderRadius: 1,
            }}
          />
          <Stack spacing={1} flexGrow={1}>
            <Button
              fullWidth
              color="info"
              sx={{ flexGrow: 1 }}
              onClick={onShow}
              disabled={disabled}
            >
              <Box sx={{ maxWidth: '10em' }}>
                <WeaponName weaponKey={key} />
              </Box>
            </Button>
            {hasRefinement && (
              <RefinementDropdown
                disabled={disabled}
                refinement={refinement}
                setRefinement={(r) => setWeapon({ refinement: r })}
              />
            )}
          </Stack>
        </Box>
        <LevelSelect
          level={level}
          ascension={ascension}
          setBoth={setWeapon}
          useLow={!hasRefinement}
          disabled={disabled}
        />
        <CardDark>
          <CardHeader
            title={'Main Stats'}
            titleTypographyProps={{ variant: 'subtitle2' }}
          />
          <Divider />
          {weaponUIData && (
            <FieldDisplayList>
              {[input.weapon.main, input.weapon.sub, input.weapon.sub2].map(
                (node) => {
                  const n = weaponUIData.get(node)
                  if (n.isEmpty || !n.value) return null
                  return (
                    <NodeFieldDisplay
                      key={JSON.stringify(n.info)}
                      node={n}
                      component={ListItem}
                    />
                  )
                }
              )}
            </FieldDisplayList>
          )}
        </CardDark>
        {data && weaponSheet?.document && (
          <DocumentDisplay
            sections={weaponSheet.document}
            disabled={disabled}
          />
        )}
      </Box>
    </CardLight>
  )
}
