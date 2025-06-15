'use client'
import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { catTotal } from '@genshin-optimizer/common/util'
import {
  rarityDefIcon,
  specialityDefIcon,
  wengineAsset,
} from '@genshin-optimizer/zzz/assets'
import type { SpecialityKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  allRaritykeys,
  allSpecialityKeys,
  allWengineKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { WengineRarityToggle, WengineToggle } from '../toggles'
import { WengineName } from './WengineTrans'

type WengineSelectionModalProps = {
  show: boolean
  onHide: () => void
  onSelect: (wKey: WengineKey) => void
  wengineTypeFilter?: SpecialityKey | ''
}

export function WengineSelectionModal({
  show,
  onHide,
  onSelect,
  wengineTypeFilter,
}: WengineSelectionModalProps) {
  const { t } = useTranslation(['page_wengine'])
  const [wengineFilter, setWenginefilter] = useState<SpecialityKey[]>(
    wengineTypeFilter ? [wengineTypeFilter] : [...allSpecialityKeys]
  )

  const { database } = useDatabaseContext()
  const displayWengine = useDataEntryBase(database.displayWengine)

  useEffect(() => {
    wengineTypeFilter && setWenginefilter([wengineTypeFilter])
  }, [wengineTypeFilter])

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { rarity } = displayWengine
  const wengineIdList = useMemo(
    () =>
      allWengineKeys
        .filter((wKey) => wengineFilter.includes(getWengineStat(wKey).type))
        .filter(
          (wKey) =>
            !deferredSearchTerm ||
            t(`${wKey}`)
              .toLowerCase()
              .includes(deferredSearchTerm.toLowerCase())
        )
        .filter((wKey) => rarity.includes(getWengineStat(wKey).rarity))
        .sort((a, b) => {
          const wengineSortRarityMap = allRaritykeys
          return (
            wengineSortRarityMap.indexOf(getWengineStat(a).rarity) -
            wengineSortRarityMap.indexOf(getWengineStat(b).rarity)
          )
        }),
    [deferredSearchTerm, rarity, t, wengineFilter]
  )

  const wengineTotals = useMemo(
    () =>
      catTotal(allSpecialityKeys, (ct) =>
        allWengineKeys.forEach((wk) => {
          const wtk = getWengineStat(wk).type
          if (wk) {
            ct[wtk].total++
            if (wengineIdList.includes(wk)) ct[wtk].current++
          }
        })
      ),
    [wengineIdList]
  )

  const wengineRarityTotals = useMemo(
    () =>
      catTotal(allWengineRarityKeys, (ct) =>
        allWengineKeys.forEach((wk) => {
          const wr = getWengineStat(wk).rarity
          if (wr) {
            ct[wr].total++
            if (wengineIdList.includes(wk)) ct[wr].current++
          }
        })
      ),
    [wengineIdList]
  )

  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardContent sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <WengineToggle
            value={wengineFilter}
            totals={wengineTotals}
            onChange={setWenginefilter}
            size="small"
          />
          <WengineRarityToggle
            sx={{ height: '100%' }}
            onChange={(rarity) => database.displayWengine.set({ rarity })}
            value={rarity}
            totals={wengineRarityTotals}
            size="small"
          />
          <TextField
            autoFocus
            size="small"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setSearchTerm(e.target.value)
            }
            label={t('wengineName')}
            sx={{ height: '100%' }}
            InputProps={{
              sx: { height: '100%' },
            }}
          />
          <IconButton onClick={onHide} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </CardContent>
        <Divider />
        <CardContent>
          <Grid container spacing={1}>
            {wengineIdList.map((wengineKey) => {
              const wengineStat = getWengineStat(wengineKey)
              return (
                <Grid item key={wengineKey} lg={3} md={4}>
                  <CardThemed bgt="light" sx={{ height: '100%' }}>
                    <CardActionArea
                      onClick={() => {
                        onHide()
                        onSelect(wengineKey)
                      }}
                      sx={{ display: 'flex' }}
                    >
                      <Box
                        component={NextImage ? NextImage : 'img'}
                        src={wengineAsset(wengineKey, 'icon')}
                        sx={{ width: 100, height: 'auto' }}
                        className={` grad-${wengineStat.rarity}star`}
                      />
                      <Box sx={{ flexGrow: 1, px: 1 }}>
                        <Typography variant="subtitle1">
                          <WengineName wKey={wengineKey} />
                        </Typography>
                        <Typography
                          sx={{ display: 'flex', alignItems: 'baseline' }}
                        >
                          <ImgIcon
                            size={1.5}
                            src={specialityDefIcon(wengineStat.type)}
                          />
                          <ImgIcon
                            size={1.5}
                            src={rarityDefIcon(wengineStat.rarity)}
                          />
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </CardThemed>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
