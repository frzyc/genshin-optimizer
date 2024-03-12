import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { useOnScreen } from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type {
  RarityKey,
  WeaponKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import { allRarityKeys } from '@genshin-optimizer/gi/consts'
import { initialWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Add } from '@mui/icons-material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
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
import WeaponCard from '../../PageWeapon/WeaponCard'
import WeaponEditor from '../../PageWeapon/WeaponEditor'
import { handleMultiSelect } from '../../Util/MultiSelect'
import {
  weaponFilterConfigs,
  weaponSortConfigs,
  weaponSortMap,
} from '../../Util/WeaponSort'
import CardDark from '../Card/CardDark'
import CloseButton from '../CloseButton'
import CompareBuildButton from '../CompareBuildButton'
import ImgIcon from '../Image/ImgIcon'
import ModalWrapper from '../ModalWrapper'
import ShowingAndSortOptionSelect from '../ShowingAndSortOptionSelect'
import SolidToggleButtonGroup from '../SolidToggleButtonGroup'
import WeaponSelectionModal from './WeaponSelectionModal'

const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }
const rarityHandler = handleMultiSelect([...allRarityKeys])

export default function WeaponSwapModal({
  onChangeId,
  weaponTypeKey,
  show,
  onClose,
}: {
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
  const clickHandler = useCallback(
    (id: string) => {
      onChangeId(id)
      onClose()
    },
    [onChangeId, onClose]
  )

  const [editWeaponId, setEditWeaponId] = useState('')
  const newWeapon = useCallback(
    (weaponKey: WeaponKey) => {
      setEditWeaponId(database.weapons.new(initialWeapon(weaponKey)))
    },
    [database, setEditWeaponId]
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

  const weaponIds = useMemo(
    () =>
      (dbDirty &&
        database.weapons.values
          .filter(
            filterFunction(
              { weaponType: weaponTypeKey, rarity, name: deferredSearchTerm },
              weaponFilterConfigs()
            )
          )
          .sort(
            sortFunction(
              weaponSortMap['level'] ?? [],
              false,
              weaponSortConfigs()
            )
          )
          .map((weapon) => weapon.id)) ??
      [],
    [dbDirty, database, rarity, weaponTypeKey, deferredSearchTerm]
  )

  const [numShow, setNumShow] = useState(numToShowMap[brPt])
  // reset the numShow when artifactIds changes
  useEffect(() => {
    weaponIds && setNumShow(numToShowMap[brPt])
  }, [weaponIds, brPt])

  const [element, setElement] = useState<HTMLElement | undefined>()
  const trigger = useOnScreen(element)
  const shouldIncrease = trigger && numShow < weaponIds.length
  useEffect(() => {
    if (!shouldIncrease) return
    setNumShow((num) => num + numToShowMap[brPt])
  }, [shouldIncrease, brPt])

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

  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardDark>
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
        <CardContent sx={{ py: 1 }}>
          <Grid container>
            <Grid item flexGrow={1}>
              <Typography variant="h6">
                {weaponTypeKey ? (
                  <ImgIcon src={imgAssets.weaponTypes[weaponTypeKey]} />
                ) : null}{' '}
                {t`page_character:tabEquip.swapWeapon`}
              </Typography>
            </Grid>
            <Grid item>
              <CloseButton onClick={onClose} />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
            startIcon={<Add />}
          >
            {t('page_weapon:addWeapon')}
          </Button>
          <Grid container spacing={1}>
            {weaponIdsToShow.map((weaponId) => (
              <Grid item key={weaponId} xs={6} sm={6} md={4} lg={3}>
                <WeaponCard
                  weaponId={weaponId}
                  onClick={clickHandler}
                  extraButtons={<CompareBuildButton weaponId={weaponId} />}
                />
              </Grid>
            ))}
          </Grid>
          {weaponIds.length !== weaponIdsToShow.length && (
            <Skeleton
              ref={(node) => {
                if (!node) return
                setElement(node)
              }}
              sx={{ borderRadius: 1 }}
              variant="rectangular"
              width="100%"
              height={100}
            />
          )}
        </CardContent>
      </CardDark>
    </ModalWrapper>
  )
}
