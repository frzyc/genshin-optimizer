import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
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
import { specialityDefIcon } from '@genshin-optimizer/zzz/assets'
import type {
  Raritykey,
  SpecialityKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import { allRaritykeys, allSpecialityKeys } from '@genshin-optimizer/zzz/consts'
import { initialWengine } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import {
  Box,
  Button,
  CardActionArea,
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
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { WengineCard } from './WengineCard'
import { WengineEditor } from './WengineEditor'
import { WengineSelectionModal } from './WengineSelectionModal'
import {
  wengineFilterConfigs,
  wengineSortConfigs,
  wengineSortMap,
} from './wengineSortUtil'

const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }
const rarityHandler = handleMultiSelect([...allRaritykeys])
const wengineTypeHandler = handleMultiSelect([...allSpecialityKeys])

export function WengineSwapModal({
  wengineId,
  onChangeId,
  wengineTypeKey,
  show,
  onClose,
}: {
  wengineId: string
  onChangeId: (id: string) => void
  wengineTypeKey: SpecialityKey
  show: boolean
  onClose: () => void
}) {
  const { t } = useTranslation(['page_characters', 'page_wengine'])
  const { database } = useDatabaseContext()
  const [newWengineModalShow, setnewWengineModalShow] = useState(false)

  const [editWengineId, setEditWengineId] = useState('')
  const newWengine = useCallback(
    (wengineKey: WengineKey) => {
      setEditWengineId(database.wengines.new(initialWengine(wengineKey)))
    },
    [database]
  )
  const resetEditWengine = useCallback(() => setEditWengineId(''), [])

  const brPt = useMediaQueryUp()

  const [rarity, setRarity] = useState<Raritykey[]>(['S', 'A', 'B'])
  const [speciality, setWengineType] = useState<SpecialityKey[]>([
    wengineTypeKey,
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const allWengines = useDataManagerValues(database.wengines)
  const wengineIds = useMemo(() => {
    const filterFunc = filterFunction(
      { speciality, rarity, name: deferredSearchTerm },
      wengineFilterConfigs()
    )
    const sortFunc = sortFunction(
      wengineSortMap['level'] ?? [],
      false,
      wengineSortConfigs()
    )
    let wengineIds = allWengines
      .filter(filterFunc)
      .sort(sortFunc)
      .map((wengine) => wengine.id)
    if (wengineId && database.wengines.get(wengineId)) {
      // always show wengineIds first if it exists
      wengineIds = wengineIds.filter((id) => id !== wengineId) // remove
      wengineIds.unshift(wengineId) // add to beginnig
    }
    return wengineIds
  }, [
    speciality,
    rarity,
    deferredSearchTerm,
    allWengines,
    wengineId,
    database.wengines,
  ])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    wengineIds.length
  )
  const wengineIdsToShow = useMemo(
    () => wengineIds.slice(0, numShow),
    [wengineIds, numShow]
  )

  // for pagination
  const totalShowing = `${wengineIds.length}`

  const showingTextProps = {
    numShowing: wengineIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'page_wengine',
  }
  const setSwapWengineId = useCallback(
    (swapWengineId: string | '') => {
      onChangeId(swapWengineId)
      onClose()
    },
    [onChangeId, onClose]
  )

  return (
    <>
      <Suspense fallback={false}>
        <WengineSelectionModal
          show={newWengineModalShow}
          onHide={() => setnewWengineModalShow(false)}
          onSelect={newWengine}
          wengineTypeFilter={wengineTypeKey}
        />
      </Suspense>
      {/* Editor/character detail display */}
      <Suspense fallback={false}>
        <WengineEditor
          wengineId={editWengineId}
          footer
          onClose={resetEditWengine}
        />
      </Suspense>
      <ModalWrapper open={show} onClose={onClose}>
        <CardThemed>
          <CardHeader
            title={
              <Typography variant="h6" display="flex" gap={1}>
                {wengineTypeKey ? (
                  <ImgIcon src={specialityDefIcon(wengineTypeKey)} />
                ) : null}
                <span>{t('page_characters:tabEquip.swapWengine')}</span>
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
                  value={speciality}
                >
                  {allSpecialityKeys.map((sk) => (
                    <ToggleButton
                      key={sk}
                      value={sk}
                      onClick={() =>
                        setWengineType(wengineTypeHandler(speciality, sk))
                      }
                    >
                      <ImgIcon
                        src={specialityDefIcon(sk)}
                        size={2}
                        sideMargin
                      />
                    </ToggleButton>
                  ))}
                </SolidToggleButtonGroup>
              </Grid>
              <Grid item>
                <SolidToggleButtonGroup
                  sx={{ height: '100%' }}
                  value={rarity}
                  size="small"
                >
                  {allRaritykeys.map((rarityKey) => (
                    <ToggleButton
                      key={rarityKey}
                      value={rarityKey}
                      onClick={() =>
                        setRarity(rarityHandler(rarity, rarityKey))
                      }
                    >
                      <Box display="flex">
                        <strong>{rarityKey}</strong>
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
                  label={t('page_wengine:wengineName')}
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
              onClick={() => setnewWengineModalShow(true)}
              color="info"
              startIcon={<AddIcon />}
            >
              {t('page_wengine:addWengine')}
            </Button>
            <Box mt={1}>
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width="100%" height={1000} />
                }
              >
                <Grid container spacing={1}>
                  {/* only show "unequip" when a wengine is equipped */}
                  {wengineId && (
                    <Grid item xs={6} sm={6} md={4} lg={3}>
                      <CardThemed
                        bgt="light"
                        sx={{ width: '100%', height: '100%' }}
                      >
                        <CardActionArea
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onClick={() => setSwapWengineId('')}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <RemoveCircleIcon sx={{ fontSize: '10em' }} />
                            <Typography>
                              {t('wengine:button.unequipWengine')}
                            </Typography>
                          </Box>
                        </CardActionArea>
                      </CardThemed>
                    </Grid>
                  )}
                  {wengineIdsToShow.map((id) => (
                    <Grid
                      item
                      key={id}
                      xs={6}
                      sm={6}
                      md={4}
                      lg={3}
                      sx={(theme) => ({
                        ...(wengineId === id && {
                          '> .MuiCard-root': {
                            outline: `${theme.spacing(0.5)} solid ${
                              theme.palette.warning.main
                            }`,
                          },
                        }),
                      })}
                    >
                      <WengineCard
                        key={id}
                        wengineId={id}
                        onClick={
                          wengineId === id
                            ? undefined
                            : () => setSwapWengineId(id)
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Suspense>
            </Box>
            {wengineIds.length !== wengineIdsToShow.length && (
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
