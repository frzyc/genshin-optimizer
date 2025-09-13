import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import type { BuildTc, ICachedWeapon } from '@genshin-optimizer/gi/db'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat, weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import {
  DataContext,
  DocumentDisplay,
  FieldDisplayList,
  NodeFieldDisplay,
  RefinementDropdown,
  WeaponLevelSelect,
  WeaponName,
  WeaponSelectionModal,
} from '@genshin-optimizer/gi/ui'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import {
  Box,
  Button,
  CardHeader,
  Divider,
  ListItem,
  Stack,
} from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { BuildTcContext } from '../../../BuildTcContext'

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
    <CardThemed bgt="light" sx={{ p: 1, mb: 1 }}>
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
        <WeaponLevelSelect
          level={level}
          ascension={ascension}
          setBoth={setWeapon}
          useLow={!hasRefinement}
          disabled={disabled}
        />
        <CardThemed>
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
                      calcRes={n}
                      component={ListItem}
                    />
                  )
                }
              )}
            </FieldDisplayList>
          )}
        </CardThemed>
        {data && weaponSheet?.document && (
          <DocumentDisplay
            sections={weaponSheet.document}
            disabled={disabled}
          />
        )}
      </Box>
    </CardThemed>
  )
}
