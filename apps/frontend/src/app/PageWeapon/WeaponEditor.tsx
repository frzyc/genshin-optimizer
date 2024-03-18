import { useBoolState } from '@genshin-optimizer/common/react-util'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase, useWeapon } from '@genshin-optimizer/gi/db-ui'
import { milestoneLevelsLow } from '@genshin-optimizer/gi/util'
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
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import { LocationAutocomplete } from '../Components/Character/LocationAutocomplete'
import DocumentDisplay from '../Components/DocumentDisplay'
import { FieldDisplayList, NodeFieldDisplay } from '../Components/FieldDisplay'
import LevelSelect from '../Components/LevelSelect'
import ModalWrapper from '../Components/ModalWrapper'
import RefinementDropdown from '../Components/RefinementDropdown'
import { StarsDisplay } from '../Components/StarDisplay'
import { DataContext } from '../Context/DataContext'
import type CharacterSheet from '../Data/Characters/CharacterSheet'
import { getWeaponSheet } from '../Data/Weapons'
import { uiInput as input } from '../Formula'
import { computeUIData, dataObjForWeapon } from '../Formula/api'
import type { LocationKey } from '../Types/consts'
const WeaponSelectionModal = React.lazy(
  () => import('../Components/Weapon/WeaponSelectionModal')
)
type WeaponStatsEditorCardProps = {
  weaponId: string
  footer?: boolean
  onClose?: () => void
  extraButtons?: JSX.Element
}
export default function WeaponEditor({
  weaponId: propWeaponId,
  footer = false,
  onClose,
  extraButtons,
}: WeaponStatsEditorCardProps) {
  const { data } = useContext(DataContext)

  const database = useDatabase()
  const weapon = useWeapon(propWeaponId)
  const {
    key = '',
    level = 0,
    refinement = 1,
    ascension = 0,
    lock,
    location = '',
    id,
  } = weapon ?? {}
  const weaponSheet = key ? getWeaponSheet(key) : undefined

  const weaponDispatch = useCallback(
    (newWeapon: Partial<ICachedWeapon>) => {
      database.weapons.set(propWeaponId, newWeapon)
    },
    [propWeaponId, database]
  )

  const setLocation = useCallback(
    (k: LocationKey) => id && database.weapons.set(id, { location: k }),
    [database, id]
  )
  const filter = useCallback(
    (cs: CharacterSheet) => cs.weaponTypeKey === weaponSheet?.weaponType,
    [weaponSheet]
  )

  const [showModal, onShowModal, onHideModal] = useBoolState()
  const img = key ? weaponAsset(key, ascension >= 2) : ''

  //check the levels when switching from a 5* to a 1*, for example.
  useEffect(() => {
    if (!weaponSheet || !weaponDispatch || weaponSheet.key !== weapon?.key)
      return
    if (weaponSheet.rarity <= 2 && (level > 70 || ascension > 4)) {
      const [level, ascension] = milestoneLevelsLow[0]
      weaponDispatch({ level, ascension })
    }
  }, [weaponSheet, weapon, weaponDispatch, level, ascension])

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
      <CardLight>
        <WeaponSelectionModal
          ascension={ascension}
          show={showModal}
          onHide={onHideModal}
          onSelect={(k) => weaponDispatch({ key: k })}
          // can only swap to a weapon of the same type
          weaponTypeFilter={weaponSheet && weaponSheet.weaponType}
        />
        <CardContent>
          {weaponSheet && weaponUIData && (
            <Grid container spacing={1.5}>
              {/* Left column */}
              <Grid item xs={12} sm={3}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={12}>
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                      <Box
                        component="img"
                        src={img}
                        className={`grad-${weaponSheet.rarity}star`}
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
                      <small>{weaponSheet.description}</small>
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
                      {weaponSheet?.name ?? 'Select a Weapon'}
                    </Button>
                    {weaponSheet?.hasRefinement && (
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
                  {weaponSheet && (
                    <LevelSelect
                      level={level}
                      ascension={ascension}
                      setBoth={weaponDispatch}
                      useLow={!weaponSheet.hasRefinement}
                    />
                  )}
                </Box>
                <StarsDisplay stars={weaponSheet.rarity} />
                <Typography variant="subtitle1">
                  <strong>{weaponSheet.passiveName}</strong>
                </Typography>
                <Typography gutterBottom>
                  {weaponSheet.passiveName &&
                    weaponSheet.passiveDescription(
                      weaponUIData.get(input.weapon.refinement).value - 1
                    )}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <CardDark>
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
                            node={n}
                            component={ListItem}
                          />
                        )
                      })}
                    </FieldDisplayList>
                  </CardDark>
                  {data && weaponSheet.document && (
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
                  autoCompleteProps={{ getOptionDisabled: (t) => !t.key }}
                />
              </Grid>
            </Grid>
          </CardContent>
        )}
      </CardLight>
    </ModalWrapper>
  )
}
