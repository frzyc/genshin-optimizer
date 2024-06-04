import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import type { LocationKey } from '@genshin-optimizer/sr/consts'
import type { IRelic } from '@genshin-optimizer/sr/srod'
import { getRelicMainStatDisplayVal } from '@genshin-optimizer/sr/util'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from '../Character'

export type RelicCardProps = {
  relic: IRelic
  onEdit?: () => void
  onDelete?: () => void
  setLocation?: (lk: LocationKey) => void
  extraButtons?: JSX.Element
}

export function RelicCard({
  relic,
  onEdit,
  onDelete,
  setLocation,
  extraButtons,
}: RelicCardProps) {
  const { t } = useTranslation('relic')
  const {
    lock,
    slotKey,
    setKey,
    rarity,
    level,
    mainStatKey,
    substats,
    location = '',
  } = relic

  return (
    <CardThemed
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent>
        <Typography>Slot: {slotKey}</Typography>
        <Typography>Set: {setKey}</Typography>
        <Typography>Level: {level}</Typography>
        <Typography>
          Main: {mainStatKey} ◦{' '}
          {getRelicMainStatDisplayVal(rarity, mainStatKey, level)}
        </Typography>
        {substats.map((substat) => (
          <Typography key={substat.key}>
            Sub: {substat.key} ◦ {substat.value}
          </Typography>
        ))}
      </CardContent>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {setLocation ? (
            <LocationAutocomplete locKey={location} setLocKey={setLocation} />
          ) : (
            // TODO: replace with LocationName component after porting it from GO
            <Typography>{location}</Typography>
          )}
        </Box>
        <Box
          display="flex"
          gap={1}
          alignItems="stretch"
          height="100%"
          sx={{ '& .MuiButton-root': { minWidth: 0, height: '100%' } }}
        >
          {!!onEdit && (
            <BootstrapTooltip
              title={<Typography>{t`relic:edit`}</Typography>}
              placement="top"
              arrow
            >
              <Button color="info" size="small" onClick={onEdit}>
                <EditIcon />
              </Button>
            </BootstrapTooltip>
          )}
          {!!onDelete && (
            <BootstrapTooltip
              title={lock ? t('relic:cantDeleteLock') : ''}
              placement="top"
            >
              <span>
                <Button
                  color="error"
                  size="small"
                  onClick={onDelete}
                  disabled={lock}
                  sx={{ top: '1px' }}
                >
                  <DeleteForeverIcon />
                </Button>
              </span>
            </BootstrapTooltip>
          )}
          {extraButtons}
        </Box>
      </Box>
    </CardThemed>
  )
}
