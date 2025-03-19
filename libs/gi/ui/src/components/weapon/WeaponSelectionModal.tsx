'use client'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  NextImage,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { catTotal } from '@genshin-optimizer/common/util'
import { imgAssets, weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponKey, WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import {
  allRarityKeys,
  allWeaponKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { WeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
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
import { WeaponRarityToggle, WeaponToggle } from '../toggles'
import { WeaponName } from './WeaponTrans'

type WeaponSelectionModalProps = {
  show: boolean
  ascension?: number
  onHide: () => void
  onSelect: (wKey: WeaponKey) => void
  filter?: (sheet: WeaponSheet) => boolean
  weaponTypeFilter?: WeaponTypeKey | ''
}

export function WeaponSelectionModal({
  show,
  ascension = 0,
  onHide,
  onSelect,
  filter = () => true,
  weaponTypeFilter,
}: WeaponSelectionModalProps) {
  const { t } = useTranslation(['page_weapon', 'weaponNames_gen'])
  const [weaponFilter, setWeaponfilter] = useState<WeaponTypeKey[]>(
    weaponTypeFilter ? [weaponTypeFilter] : [...allWeaponTypeKeys]
  )

  const database = useDatabase()
  const [state, setState] = useState(database.displayWeapon.get())
  useEffect(
    () => database.displayWeapon.follow((_r, dbMeta) => setState(dbMeta)),
    [database]
  )

  useEffect(() => {
    weaponTypeFilter && setWeaponfilter([weaponTypeFilter])
  }, [weaponTypeFilter])

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { rarity } = state
  const weaponIdList = useMemo(
    () =>
      allWeaponKeys
        .filter((wKey) => filter(getWeaponSheet(wKey)))
        .filter((wKey) => weaponFilter.includes(getWeaponStat(wKey).weaponType))
        .filter(
          (wKey) =>
            !deferredSearchTerm ||
            t(`weaponNames_gen:${wKey}`)
              .toLowerCase()
              .includes(deferredSearchTerm.toLowerCase())
        )
        .filter((wKey) => rarity.includes(getWeaponStat(wKey).rarity))
        .sort((a, b) => getWeaponStat(b).rarity - getWeaponStat(a).rarity),
    [deferredSearchTerm, filter, rarity, t, weaponFilter]
  )

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        allWeaponKeys.forEach((wk) => {
          const wtk = getWeaponStat(wk).weaponType
          ct[wtk].total++
          if (weaponIdList.includes(wk)) ct[wtk].current++
        })
      ),
    [weaponIdList]
  )

  const weaponRarityTotals = useMemo(
    () =>
      catTotal(allRarityKeys, (ct) =>
        allWeaponKeys.forEach((wk) => {
          const wr = getWeaponStat(wk).rarity
          ct[wr].total++
          if (weaponIdList.includes(wk)) ct[wr].current++
        })
      ),
    [weaponIdList]
  )

  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardContent sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <WeaponToggle
            value={weaponFilter}
            totals={weaponTotals}
            onChange={setWeaponfilter}
            disabled={!!weaponTypeFilter}
            size="small"
          />
          <WeaponRarityToggle
            sx={{ height: '100%' }}
            onChange={(rarity) => database.displayWeapon.set({ rarity })}
            value={rarity}
            totals={weaponRarityTotals}
            size="small"
          />
          <TextField
            autoFocus
            size="small"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setSearchTerm(e.target.value)
            }
            label={t('weaponName')}
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
            {weaponIdList.map((weaponKey) => {
              const weaponStat = getWeaponStat(weaponKey)
              return (
                <Grid item key={weaponKey} lg={3} md={4}>
                  <CardThemed bgt="light" sx={{ height: '100%' }}>
                    <CardActionArea
                      onClick={() => {
                        onHide()
                        onSelect(weaponKey)
                      }}
                      sx={{ display: 'flex' }}
                    >
                      <Box
                        component={NextImage ? NextImage : 'img'}
                        src={weaponAsset(weaponKey, ascension >= 2)}
                        sx={{ width: 100, height: 'auto' }}
                        className={` grad-${weaponStat.rarity}star`}
                      />
                      <Box sx={{ flexGrow: 1, px: 1 }}>
                        <Typography variant="subtitle1">
                          <WeaponName weaponKey={weaponKey} />
                        </Typography>
                        <Typography
                          sx={{ display: 'flex', alignItems: 'baseline' }}
                        >
                          <ImgIcon
                            size={1.5}
                            src={imgAssets.weaponTypes?.[weaponStat.weaponType]}
                          />
                          <StarsDisplay stars={weaponStat.rarity} colored />
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
