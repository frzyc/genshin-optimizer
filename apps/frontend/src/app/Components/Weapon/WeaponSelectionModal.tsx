import { imgAssets, weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponKey, WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import {
  allRarityKeys,
  allWeaponKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
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
import { getWeaponSheet } from '../../Data/Weapons'
import type WeaponSheet from '../../Data/Weapons/WeaponSheet'
import { catTotal } from '../../Util/totalUtils'
import CardDark from '../Card/CardDark'
import CardLight from '../Card/CardLight'
import ImgIcon from '../Image/ImgIcon'
import ModalWrapper from '../ModalWrapper'
import { StarsDisplay } from '../StarDisplay'
import WeaponRarityToggle from '../ToggleButton/WeaponRarityToggle'
import WeaponToggle from '../ToggleButton/WeaponToggle'

type WeaponSelectionModalProps = {
  show: boolean
  ascension?: number
  onHide: () => void
  onSelect: (wKey: WeaponKey) => void
  filter?: (sheet: WeaponSheet) => boolean
  weaponTypeFilter?: WeaponTypeKey | ''
}

export default function WeaponSelectionModal({
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
    () => database.displayWeapon.follow((r, dbMeta) => setState(dbMeta)),
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
        .filter((wKey) =>
          weaponFilter.includes(getWeaponSheet(wKey).weaponType)
        )
        .filter(
          (wKey) =>
            !deferredSearchTerm ||
            t(`weaponNames_gen:${wKey}`)
              .toLowerCase()
              .includes(deferredSearchTerm.toLowerCase())
        )
        .filter((wKey) => rarity.includes(getWeaponSheet(wKey).rarity))
        .sort((a, b) => getWeaponSheet(b).rarity - getWeaponSheet(a).rarity),
    [deferredSearchTerm, filter, rarity, t, weaponFilter]
  )

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        allWeaponKeys.forEach((wk) => {
          const wtk = getWeaponSheet(wk).weaponType
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
          const wr = getWeaponSheet(wk).rarity
          ct[wr].total++
          if (weaponIdList.includes(wk)) ct[wr].current++
        })
      ),
    [weaponIdList]
  )

  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardDark>
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
              const weaponSheet = getWeaponSheet(weaponKey)
              return (
                <Grid item key={weaponKey} lg={3} md={4}>
                  <CardLight sx={{ height: '100%' }}>
                    <CardActionArea
                      onClick={() => {
                        onHide()
                        onSelect(weaponKey)
                      }}
                      sx={{ display: 'flex' }}
                    >
                      <Box
                        component="img"
                        src={weaponAsset(weaponKey, ascension >= 2)}
                        sx={{ width: 100, height: 'auto' }}
                        className={` grad-${weaponSheet.rarity}star`}
                      />
                      <Box sx={{ flexGrow: 1, px: 1 }}>
                        <Typography variant="subtitle1">
                          {weaponSheet.name}
                        </Typography>
                        <Typography
                          sx={{ display: 'flex', alignItems: 'baseline' }}
                        >
                          <ImgIcon
                            size={1.5}
                            src={
                              imgAssets.weaponTypes?.[weaponSheet.weaponType]
                            }
                          />
                          <StarsDisplay stars={weaponSheet.rarity} colored />
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </CardLight>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </CardDark>
    </ModalWrapper>
  )
}
