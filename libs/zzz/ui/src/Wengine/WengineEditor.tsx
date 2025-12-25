'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ImgIcon, ModalWrapper } from '@genshin-optimizer/common/ui'
import { FieldDisplayList } from '@genshin-optimizer/game-opt/sheet-ui'
import { rarityDefIcon, wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedWengine } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext, useWengine } from '@genshin-optimizer/zzz/db-ui'
import { Translate } from '@genshin-optimizer/zzz/i18n'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { Lock, LockOpen } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete, StatDisplay } from '../Character'
import { LevelSelect } from '../LevelSelect'
import { PhaseDropdown } from './PhaseDropdown'
import { WengineSelectionModal } from './WengineSelectionModal'
import { WengineSubstatDisplay } from './WengineSubstatDisplay'
import {
  WengineName,
  WengineRefineDesc,
  WengineRefineName,
} from './WengineTrans'

type WengineStatsEditorCardProps = {
  wengineId: string
  footer?: boolean
  onClose?: () => void
  extraButtons?: JSX.Element
}
export function WengineEditor({
  wengineId: propWengineId,
  footer = false,
  onClose,
  extraButtons,
}: WengineStatsEditorCardProps) {
  const { t } = useTranslation(['page_wengine'])
  const { database } = useDatabaseContext()
  const wengine = useWengine(propWengineId)
  const {
    key,
    level = 0,
    phase = 1,
    modification = 0,
    lock,
    location = '',
    id,
  } = wengine ?? {}
  const wengineStat = key ? getWengineStat(key) : undefined
  const wengineType = wengineStat?.type
  const wengineStats = key
    ? getWengineStats(key, level, phase, modification)
    : undefined
  const wengineDispatch = useCallback(
    (newWengine: Partial<ICachedWengine>) => {
      database.wengines.set(propWengineId, newWengine)
    },
    [database.wengines, propWengineId]
  )

  const setLocation = useCallback(
    (k: LocationKey | '') => {
      id && database.wengines.set(id, { location: k })
    },
    [database, id]
  )

  const deleteWengine = useCallback(
    async (key: string) => {
      if (!wengine) return
      const name = t(`${key}`)

      if (!window.confirm(t('removeWengine', { value: name }))) return
      database.wengines.remove(key)
      if (propWengineId === key)
        database.displayWengine.set({ editWengineId: '' })
    },
    [wengine, t, database.wengines, database.displayWengine, propWengineId]
  )

  const [showModal, onShowModal, onHideModal] = useBoolState()
  const img = key ? wengineAsset(key, 'icon') : ''
  return (
    <ModalWrapper
      open={!!propWengineId}
      onClose={onClose}
      containerProps={{ maxWidth: 'md' }}
    >
      <CardThemed bgt="light">
        <WengineSelectionModal
          show={showModal}
          onHide={onHideModal}
          onSelect={(k) => wengineDispatch({ key: k })}
          // can only swap to a weapon of the same type
          wengineTypeFilter={wengineType}
        />
        <CardContent>
          {wengineStat && (
            <Grid container spacing={1.5}>
              {/* Left column */}
              <Grid item xs={12} sm={3}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={12}>
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                      <Box
                        component="img"
                        src={img}
                        className={`grad-${wengineStat.rarity}star`}
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
                          id && database.wengines.set(id, { lock: !lock })
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
                      <small>
                        {key && (
                          <Translate ns={`wengine_${key}_gen`} key18="desc3" />
                        )}
                      </small>
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
                      {key ? <WengineName wKey={key} /> : 'Select a Wengine'}
                    </Button>
                    {key && (
                      <PhaseDropdown
                        phase={phase}
                        setPhase={(r) => wengineDispatch({ phase: r })}
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
                    <LevelSelect
                      level={level}
                      milestone={modification}
                      setBoth={({ level, milestone }) =>
                        wengineDispatch({ level, modification: milestone })
                      }
                    />
                  )}
                </Box>
                <ImgIcon size={1.5} src={rarityDefIcon(wengineStat.rarity)} />
                <Typography variant="subtitle1">
                  <strong>{key && <WengineRefineName wKey={key} />}</strong>
                </Typography>
                <Typography gutterBottom>
                  {key && <WengineRefineDesc phase={phase} wKey={key} />}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <CardThemed>
                    <CardHeader
                      title={'Main Stats'}
                      titleTypographyProps={{ variant: 'subtitle2' }}
                    />
                    <Divider />
                    <FieldDisplayList sx={{ padding: '8px' }}>
                      {/* Might Need to replace this with NodeFieldDisplay from GO */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexGrow: 1,
                          fontWeight: 'bold',
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          noWrap
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            fontWeight: 'bold',
                          }}
                        >
                          <StatDisplay statKey={'atk'} />
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {wengineStats && wengineStats['atk_base'].toFixed()}
                        </Typography>
                      </Box>

                      <WengineSubstatDisplay
                        substatKey={wengineStat.second_statkey}
                        substatValue={
                          wengineStats
                            ? wengineStats[wengineStat.second_statkey]
                            : 0
                        }
                      />
                    </FieldDisplayList>
                  </CardThemed>
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
                  locKey={location}
                  setLocKey={setLocation}
                />
              </Grid>
              <Grid item flexGrow={1}>
                {!!deleteWengine && (
                  <Button
                    color="error"
                    size="small"
                    onClick={() => deleteWengine(id)}
                    disabled={!!location || lock}
                  >
                    <DeleteForeverIcon />
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        )}
      </CardThemed>
    </ModalWrapper>
  )
}
