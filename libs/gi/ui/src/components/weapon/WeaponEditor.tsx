import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type {
  CharacterKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase, useWeapon } from '@genshin-optimizer/gi/db-ui'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import {
  getCharStat,
  getWeaponStat,
  weaponHasRefinement,
} from '@genshin-optimizer/gi/stats'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { dataObjForWeapon, uiInput as input } from '@genshin-optimizer/gi/wr'
import { Lock, LockOpen } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  ListItem,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { DataContext } from '../../context'
import { DocumentDisplay } from '../DocumentDisplay'
import { FieldDisplayList, NodeFieldDisplay } from '../FieldDisplay'
import { RefinementDropdown } from '../RefinementDropdown'
import { LocationAutocomplete } from '../character'
import { WeaponLevelSelect } from './WeaponLevelSelect'
import { WeaponSelectionModal } from './WeaponSelectionModal'
import {
  WeaponDesc,
  WeaponName,
  WeaponPassiveDesc,
  WeaponPassiveName,
} from './WeaponTrans'

type WeaponStatsEditorCardProps = {
  weaponId: string
  footer?: boolean
  onClose?: () => void
  extraButtons?: JSX.Element
}
export function WeaponEditor({
  weaponId: propWeaponId,
  footer = false,
  onClose,
  extraButtons,
}: WeaponStatsEditorCardProps) {
  const { data } = useContext(DataContext)

  const database = useDatabase()
  const weapon = useWeapon(propWeaponId)
  const {
    key,
    level = 0,
    refinement = 1,
    ascension = 0,
    lock,
    location = '',
    id,
  } = weapon ?? {}
  const weaponSheet = key && getWeaponSheet(key)
  const weaponStat = key && getWeaponStat(key)
  const weaponType = weaponStat?.weaponType
  const weaponDispatch = useCallback(
    (newWeapon: Partial<ICachedWeapon>) => {
      database.weapons.set(propWeaponId, newWeapon)
    },
    [propWeaponId, database]
  )

  const setLocation = useCallback(
    (k: LocationCharacterKey | '') =>
      id && database.weapons.set(id, { location: k }),
    [database, id]
  )
  const filter = useCallback(
    (ck: CharacterKey) => weaponType === getCharStat(ck).weaponType,
    [weaponType]
  )

  const [showModal, onShowModal, onHideModal] = useBoolState()
  const img = key ? weaponAsset(key, ascension >= 2) : ''

  const weaponUIData = useMemo(
    () =>
      weaponSheet &&
      weapon &&
      computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
    [weaponSheet, weapon]
  )

  return (
    <ModalWrapper
      open={!!propWeaponId}
      onClose={onClose}
      containerProps={{ maxWidth: 'md' }}
    >
      <CardThemed bgt="light">
        <WeaponSelectionModal
          ascension={ascension}
          show={showModal}
          onHide={onHideModal}
          onSelect={(k) => weaponDispatch({ key: k })}
          // can only swap to a weapon of the same type
          weaponTypeFilter={weaponType}
        />
        <CardContent>
          {weaponStat && weaponUIData && (
            <Grid container spacing={1.5}>
              {/* Left column */}
              <Grid item xs={12} sm={3}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={12}>
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                      <Box
                        component="img"
                        src={img}
                        className={`grad-${weaponStat.rarity}star`}
                        sx={{
                          maxWidth: 256,
                          width: '100%',
                          height: 'auto',
                          borderRadius: 1,
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={() =>
                          id && database.weapons.set(id, { lock: !lock })
                        }
                        sx={{
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                          zIndex: 2,
                        }}
                      >
                        {lock ? <Lock /> : <LockOpen />}
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={12}>
                    <Typography>
                      <small>{key && <WeaponDesc weaponKey={key} />}</small>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* right column */}
              <Grid
                item
                xs={12}
                sm={9}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Box display="flex" gap={1} flexWrap="wrap">
                  <ButtonGroup>
                    <Button color="info" onClick={onShowModal}>
                      {(key && <WeaponName weaponKey={key} />) ||
                        'Select a Weapon'}
                    </Button>
                    {key && weaponHasRefinement(key) && (
                      <RefinementDropdown
                        refinement={refinement}
                        setRefinement={(r) => weaponDispatch({ refinement: r })}
                      />
                    )}
                    {extraButtons}
                  </ButtonGroup>
                  {onClose && (
                    <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {key && (
                    <WeaponLevelSelect
                      level={level}
                      ascension={ascension}
                      setBoth={weaponDispatch}
                      useLow={!weaponHasRefinement(key)}
                    />
                  )}
                </Box>
                <StarsDisplay stars={weaponStat.rarity} />
                <Typography variant="subtitle1">
                  <strong>
                    {key && <WeaponPassiveName weaponKey={key} />}
                  </strong>
                </Typography>
                <Typography gutterBottom>
                  {key && (
                    <WeaponPassiveDesc
                      weaponKey={key}
                      refineIndex={
                        (weaponUIData.get(input.weapon.refinement).value ?? 1) -
                        1
                      }
                    />
                  )}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <CardThemed>
                    <CardHeader
                      title={'Main Stats'}
                      titleTypographyProps={{ variant: 'subtitle2' }}
                    />
                    <Divider />
                    <FieldDisplayList>
                      {[
                        input.weapon.main,
                        input.weapon.sub,
                        input.weapon.sub2,
                      ].map((node) => {
                        const n = weaponUIData.get(node)
                        if (n.isEmpty || !n.value) return null
                        return (
                          <NodeFieldDisplay
                            key={JSON.stringify(n.info)}
                            calcRes={n}
                            component={ListItem}
                          />
                        )
                      })}
                    </FieldDisplayList>
                  </CardThemed>
                  {data && weaponSheet?.document && (
                    <DocumentDisplay sections={weaponSheet.document} />
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
        {footer && id && (
          <CardContent sx={{ py: 1 }}>
            <Grid container spacing={1}>
              <Grid item flexGrow={1}>
                <LocationAutocomplete
                  location={location}
                  setLocation={setLocation}
                  filter={filter}
                  autoCompleteProps={{
                    getOptionDisabled: (t) => !t.key,
                    disableClearable: true,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        )}
      </CardThemed>
    </ModalWrapper>
  )
}
