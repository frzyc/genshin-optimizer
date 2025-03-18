import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  ShowingAndSortOptionSelect,
  SolidToggleButtonGroup,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import {
  filterFunction,
  handleMultiSelect,
  sortFunction,
} from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type {
  RarityKey,
  WeaponKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import { allRarityKeys } from '@genshin-optimizer/gi/consts'
import { initialWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  ToggleButton,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  weaponFilterConfigs,
  weaponSortConfigs,
  weaponSortMap,
} from '../../util'
import { CompareBuildWrapper } from '../build/CompareBuildWrapper'
import { WeaponCard } from './WeaponCard'
import { WeaponEditor } from './WeaponEditor'
import { WeaponSelectionModal } from './WeaponSelectionModal'

const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }
const rarityHandler = handleMultiSelect([...allRarityKeys])

export function WeaponSwapModal({
  weaponId,
  onChangeId,
  weaponTypeKey,
  show,
  onClose,
}: {
  weaponId: string
  onChangeId: (id: string) => void
  weaponTypeKey: WeaponTypeKey
  show: boolean
  onClose: () => void
}) {
  const { t } = useTranslation([
    'page_character',
    'page_weapon',
    'weaponNames_gen',
  ])
  const database = useDatabase()
  const [newWeaponModalShow, setnewWeaponModalShow] = useState(false)

  const [editWeaponId, setEditWeaponId] = useState('')
  const newWeapon = useCallback(
    (weaponKey: WeaponKey) => {
      setEditWeaponId(database.weapons.new(initialWeapon(weaponKey)))
    },
    [database]
  )
  const resetEditWeapon = useCallback(() => setEditWeaponId(''), [])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(
    () => database.weapons.followAny(forceUpdate),
    [forceUpdate, database]
  )

  const brPt = useMediaQueryUp()

  const [rarity, setRarity] = useState<RarityKey[]>([5, 4, 3])
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const weaponIds = useMemo(() => {
    const filterFunc = filterFunction(
      { weaponType: weaponTypeKey, rarity, name: deferredSearchTerm },
      weaponFilterConfigs()
    )
    const sortFunc = sortFunction(
      weaponSortMap.level ?? [],
      false,
      weaponSortConfigs()
    )
    let weaponIds = database.weapons.values
      .filter(filterFunc)
      .sort(sortFunc)
      .map((weapon) => weapon.id)
    if (weaponId && database.weapons.get(weaponId)) {
      // always show weaponId first if it exists
      weaponIds = weaponIds.filter((id) => id !== weaponId) // remove
      weaponIds.unshift(weaponId) // add to beginnig
    }
    return dbDirty && weaponIds
  }, [
    weaponTypeKey,
    rarity,
    deferredSearchTerm,
    database.weapons,
    weaponId,
    dbDirty,
  ])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    weaponIds.length
  )
  const weaponIdsToShow = useMemo(
    () => weaponIds.slice(0, numShow),
    [weaponIds, numShow]
  )

  // for pagination
  const totalShowing = `${weaponIds.length}`

  const showingTextProps = {
    numShowing: weaponIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'page_weapon',
  }
  const [swapWeaponId, setSwapWeaponId] = useState('')
  const clickHandler = useCallback(() => {
    if (!swapWeaponId) {
      return
    }
    onChangeId(swapWeaponId)
    setSwapWeaponId('')
    onClose()
  }, [onChangeId, onClose, swapWeaponId])
  return (
    <>
      <Suspense fallback={false}>
        <WeaponSelectionModal
          show={newWeaponModalShow}
          onHide={() => setnewWeaponModalShow(false)}
          onSelect={newWeapon}
          weaponTypeFilter={weaponTypeKey}
        />
      </Suspense>
      {/* Editor/character detail display */}
      <Suspense fallback={false}>
        <WeaponEditor
          weaponId={editWeaponId}
          footer
          onClose={resetEditWeapon}
        />
      </Suspense>
      <ModalWrapper open={show} onClose={onClose}>
        <CardThemed>
          <CardHeader
            title={
              <Typography variant="h6" display="flex" gap={1}>
                {weaponTypeKey ? (
                  <ImgIcon src={imgAssets.weaponTypes[weaponTypeKey]} />
                ) : null}
                <span>{t('page_character:tabEquip.swapWeapon')}</span>
              </Typography>
            }
            action={
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Grid container spacing={1}>
              <Grid item>
                <SolidToggleButtonGroup
                  sx={{ height: '100%' }}
                  value={rarity}
                  size="small"
                >
                  {allRarityKeys.map((star) => (
                    <ToggleButton
                      key={star}
                      value={star}
                      onClick={() => setRarity(rarityHandler(rarity, star))}
                    >
                      <Box display="flex">
                        <strong>{star}</strong>
                        <StarRoundedIcon />
                      </Box>
                    </ToggleButton>
                  ))}
                </SolidToggleButtonGroup>
              </Grid>
              <Grid item flexGrow={1}>
                <TextField
                  autoFocus
                  size="small"
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  label={t('page_weapon:weaponName')}
                  sx={{ height: '100%' }}
                  InputProps={{
                    sx: { height: '100%' },
                  }}
                />
              </Grid>
            </Grid>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
            >
              <ShowingAndSortOptionSelect showingTextProps={showingTextProps} />
            </Box>
            <Button
              fullWidth
              onClick={() => setnewWeaponModalShow(true)}
              color="info"
              startIcon={<AddIcon />}
            >
              {t('page_weapon:addWeapon')}
            </Button>
            <CompareBuildWrapper
              weaponId={swapWeaponId}
              onHide={() => setSwapWeaponId('')}
              onEquip={clickHandler}
            />
            <Grid container spacing={1}>
              {weaponIdsToShow.map((id) => (
                <Grid
                  item
                  key={id}
                  xs={6}
                  sm={6}
                  md={4}
                  lg={3}
                  sx={(theme) => ({
                    ...(weaponId === id && {
                      '> .MuiCard-root': {
                        outline: `solid ${theme.palette.warning.main}`,
                      },
                    }),
                  })}
                >
                  <WeaponCard
                    weaponId={id}
                    onClick={
                      weaponId === id ? undefined : () => setSwapWeaponId(id)
                    }
                  />
                </Grid>
              ))}
            </Grid>
            {weaponIds.length !== weaponIdsToShow.length && (
              <Skeleton
                ref={(node) => {
                  if (!node) return
                  setTriggerElement(node)
                }}
                sx={{ borderRadius: 1 }}
                variant="rectangular"
                width="100%"
                height={100}
              />
            )}
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
