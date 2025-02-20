'use client'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import {
  CharacterContext,
  useDatabaseContext,
  useDisc,
  useDiscs,
} from '@genshin-optimizer/zzz/db-ui'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DiscCard, DiscEditor } from '../Disc'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const
export function EquippedGrid() {
  const { database } = useDatabaseContext()
  const character = useContext(CharacterContext)
  const [discIdToEdit, setDiscIdToEdit] = useState<string | undefined>()
  const discIds = useMemo(() => {
    return objKeyMap(
      allDiscSlotKeys,
      (slotKey) => character?.equippedDiscs[slotKey]
    )
  }, [character])
  const onEdit = useCallback((id: string) => {
    setDiscIdToEdit(id)
  }, [])
  const discs = useDiscs(discIds)
  const disc = useDisc(discIdToEdit)

  return (
    <Box>
      <Suspense fallback={false}>Weapon Editor</Suspense>
      <Suspense fallback={false}>
        {disc && (
          <DiscEditor
            disc={disc}
            show={!!discIdToEdit}
            onShow={() => setDiscIdToEdit(discIdToEdit)}
            onClose={() => setDiscIdToEdit(undefined)}
          />
        )}
      </Suspense>
      <Grid item xs={1} display="flex" flexDirection="column">
        Weapon Swap
      </Grid>
      <Grid item columns={columns} container spacing={1}>
        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid item xs={1} key={disc?.id || slotKey}>
              {disc?.id && database.discs.keys.includes(disc.id) ? (
                <DiscCard
                  disc={disc}
                  extraButtons={<DiscSwapButtonButton />}
                  onEdit={() => onEdit(disc.id)}
                  onLockToggle={() =>
                    database.discs.set(disc.id, ({ lock }) => ({ lock: !lock }))
                  }
                />
              ) : (
                <DiscSwapCard slotKey={slotKey} />
              )}
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}

export function DiscSwapCard({
  slotKey,
}: {
  slotKey: DiscSlotKey | undefined
}) {
  const { t } = useTranslation('disc')
  return (
    <CardThemed
      bgt="light"
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Typography>{t(`slotName`, { slotKey: slotKey })}</Typography>
      </CardContent>
      <Divider />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button color="info" sx={{ borderRadius: '1em' }}>
          <SwapHorizIcon sx={{ height: 100, width: 100 }} />
        </Button>
      </Box>
    </CardThemed>
  )
}
function DiscSwapButtonButton() {
  const { t } = useTranslation('page_characters')
  return (
    <Tooltip
      title={<Typography>{t('tabEquip.swapDisc')}</Typography>}
      placement="top"
      arrow
    >
      <Button color="info" size="small">
        <SwapHorizIcon />
      </Button>
    </Tooltip>
  )
}
