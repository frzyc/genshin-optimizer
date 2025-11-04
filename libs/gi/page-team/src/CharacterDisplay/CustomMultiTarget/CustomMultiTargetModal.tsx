import {
  CardThemed,
  InfoTooltip,
  ModalWrapper,
  usePrev,
} from '@genshin-optimizer/common/ui'
import { deepClone } from '@genshin-optimizer/common/util'
import type { CustomMultiTarget } from '@genshin-optimizer/gi/db'
import { initCustomMultiTarget } from '@genshin-optimizer/gi/db'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { DataContext } from '@genshin-optimizer/gi/ui'
import { UIData } from '@genshin-optimizer/gi/uidata'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import CustomMultiTargetCard from './CustomMultiTargetCard'
import CustomMultiTargetImportBtn from './CustomMultiTargetImportBtn'

export function CustomMultiTargetModal({
  open,
  onClose: onCloseModal,
}: {
  open: boolean
  onClose: () => void
}) {
  const database = useDatabase()
  const { t } = useTranslation('page_character')
  const { teamChar, teamCharId } = useContext(TeamCharacterContext)
  const [customMultiTargets, setCustomTargets] = useState(
    () => teamChar.customMultiTargets
  )

  if (usePrev(teamChar.customMultiTargets) !== teamChar.customMultiTargets)
    setCustomTargets(teamChar.customMultiTargets)

  const addNewCustomMultiTarget = useCallback(() => {
    setCustomTargets([
      initCustomMultiTarget(customMultiTargets.length + 1),
      ...customMultiTargets,
    ])
  }, [customMultiTargets, setCustomTargets])
  const setCustomMultiTarget = useCallback(
    (ind: number) => (newTarget: CustomMultiTarget) => {
      const customTargets_ = [...customMultiTargets]
      customTargets_[ind] = newTarget
      setCustomTargets(customTargets_)
    },
    [customMultiTargets, setCustomTargets]
  )
  const deleteCustomMultiTarget = useCallback(
    (ind: number) => () => {
      if (
        customMultiTargets[ind].targets.length &&
        !window.confirm(
          `Are you sure you want to delete "${customMultiTargets[ind].name}"?`
        )
      )
        return
      const customTargets_ = [...customMultiTargets]
      customTargets_.splice(ind, 1)
      setCustomTargets(customTargets_)
    },
    [customMultiTargets, setCustomTargets]
  )
  const dupCustomMultiTarget = useCallback(
    (ind: number) => () => {
      const customTargets_ = [...customMultiTargets]
      const newTarget = deepClone(customMultiTargets[ind])
      newTarget.name = `${newTarget.name} (Duplicate)`
      customTargets_.splice(ind, 0, newTarget)
      setCustomTargets(customTargets_)
    },
    [customMultiTargets, setCustomTargets]
  )
  const onClose = useCallback(() => {
    onCloseModal()
    database.teamChars.set(teamCharId, {
      customMultiTargets,
    })
  }, [database, teamCharId, customMultiTargets, onCloseModal])

  const { data: origUIData, teamData } = useContext(DataContext)
  const dataContextObj = useMemo(() => {
    // Make sure that the fields we're deleting belong to
    // copies. We don't need deep copies though, as the
    // rest of the Data are still intact.
    const origData = origUIData.data[0]
    const newData = {
      ...origData,
      hit: { ...origData.hit },
      infusion: { ...origData.infusion },
    }
    delete newData.hit.reaction
    delete newData.infusion.team
    return {
      data: new UIData(newData, undefined),
      teamData,
    }
  }, [origUIData, teamData])

  const customMultiTargetDisplays = useMemo(
    () =>
      customMultiTargets.map((ctar, i) => (
        <Grid
          item
          // Use a unique key, because indices dont allow for swapping very well.
          key={`${i}${ctar.name}`}
          xs={1}
        >
          <CustomMultiTargetCard
            customMultiTarget={ctar}
            setTarget={setCustomMultiTarget(i)}
            onDup={dupCustomMultiTarget(i)}
            onDelete={deleteCustomMultiTarget(i)}
          />
        </Grid>
      )),
    [
      customMultiTargets,
      deleteCustomMultiTarget,
      dupCustomMultiTarget,
      setCustomMultiTarget,
    ]
  )

  return (
    <DataContext.Provider value={dataContextObj}>
      <ModalWrapper
        open={open}
        onClose={onClose}
        containerProps={{ sx: { overflow: 'visible' } }}
      >
        <Suspense
          fallback={
            <Skeleton variant="rectangular" height="100%" width="100%" />
          }
        >
          <CardThemed>
            <CardHeader
              title={
                <Box display="flex" gap={1} alignItems="center">
                  <DashboardCustomizeIcon />
                  <Typography variant="h6">{t('multiTarget.title')}</Typography>
                  <InfoTooltip
                    title={
                      <Typography>
                        <Trans t={t} i18nKey="multiTarget.info1">
                          Note: Community created Multi-Optimization Targets can
                          be found within the
                          <a
                            href={process.env['NX_URL_DISCORD_GO']}
                            target="_blank"
                            rel="noreferrer"
                          >
                            GO Discord
                          </a>
                          or
                          <a
                            href={process.env['NX_URL_KQM_MULTI_GUIDE']}
                            target="_blank"
                            rel="noreferrer"
                          >
                            KQM Multi-Opt Guide
                          </a>
                          , however the validity of such configurations cannot
                          be guaranteed.
                        </Trans>
                        <br />
                        <br />
                        {t('multiTarget.info2')}
                      </Typography>
                    }
                  />
                </Box>
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
              <Box>
                <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
                  <Grid item xs={1}>
                    <Button
                      fullWidth
                      onClick={addNewCustomMultiTarget}
                      startIcon={<AddIcon />}
                    >
                      {t('multiTarget.addNewMTarget')}
                    </Button>
                  </Grid>
                  <Grid item xs={1}>
                    <CustomMultiTargetImportBtn
                      setCustomMultiTarget={setCustomMultiTarget(
                        customMultiTargets.length
                      )}
                      btnProps={{ fullWidth: true }}
                    />
                  </Grid>
                  {customMultiTargetDisplays}
                </Grid>
              </Box>
            </CardContent>
          </CardThemed>
        </Suspense>
      </ModalWrapper>
    </DataContext.Provider>
  )
}
