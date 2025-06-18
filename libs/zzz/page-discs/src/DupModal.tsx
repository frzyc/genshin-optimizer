import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { DiscCardObj } from '@genshin-optimizer/zzz/ui'
import CloseIcon from '@mui/icons-material/Close'
import DifferenceIcon from '@mui/icons-material/Difference'
import {
  Alert,
  Box,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
export default function DupModal({
  setDiscToEdit,
  show,
  onHide,
}: {
  setDiscToEdit: (id: string) => void
  show: boolean
  onHide: () => void
}) {
  const { t } = useTranslation('disc')
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardHeader
          title={
            <Typography
              variant="h6"
              flexGrow={1}
              display="flex"
              alignItems="center"
            >
              <DifferenceIcon sx={{ verticalAlign: 'text-top', mr: 1 }} />
              {t('showDupes')}
            </Typography>
          }
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <DupContent setDiscToEdit={setDiscToEdit} />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function DupContent({
  setDiscToEdit,
}: {
  setDiscToEdit: (id: string) => void
}) {
  const { t } = useTranslation('disc')
  const { database } = useDatabaseContext()
  const discValuesDirty = useDataManagerValues(database.discs)
  const dupList = useMemo(() => {
    const dups = [] as ICachedDisc[][]
    const discKeys = discValuesDirty && [...database.discs.keys]

    while (discKeys.length !== 0) {
      const discKey = discKeys.shift()
      if (!discKey) continue
      const disc = database.discs.get(discKey)
      if (!disc) continue
      const { duplicated } = database.discs.findDups(disc, discKeys)
      if (!duplicated.length) continue
      const dupKeys = duplicated

      dups.push(
        [disc, ...dupKeys].sort((a) =>
          (database.discs.get(a.location)?.location ?? '') ? -1 : 1
        )
      )
    }
    return dups
  }, [database.discs, discValuesDirty])
  return (
    <Stack spacing={2}>
      {dupList.map((dups) => (
        <CardThemed key={dups.join()} sx={{ overflowX: 'scroll' }}>
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            {dups.map((dupDisc) => (
              <Box key={dupDisc.id} sx={{ minWidth: 300 }}>
                <DiscCardObj
                  disc={dupDisc}
                  setLocation={(location) =>
                    database.discs.set(dupDisc.id, { location })
                  }
                  onLockToggle={() =>
                    database.discs.set(dupDisc.id, ({ lock }) => ({
                      lock: !lock,
                    }))
                  }
                  onDelete={() => database.discs.remove(dupDisc.id)}
                  onEdit={() => setDiscToEdit(dupDisc.id)}
                />
              </Box>
            ))}
          </CardContent>
        </CardThemed>
      ))}
      {!dupList.length && (
        <Alert variant="filled" severity="success">
          {t('noDupAlert')}
        </Alert>
      )}
    </Stack>
  )
}
