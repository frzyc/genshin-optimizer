import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { ArtifactCard } from '@genshin-optimizer/gi/ui'
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
  setArtifactIdToEdit,
  show,
  onHide,
}: {
  setArtifactIdToEdit: (id: string | undefined) => void
  show: boolean
  onHide: () => void
}) {
  const { t } = useTranslation('artifact')
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
              {t('showDup')}
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
          <DupContent setArtifactIdToEdit={setArtifactIdToEdit} />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function DupContent({
  setArtifactIdToEdit,
}: {
  setArtifactIdToEdit: (id: string | undefined) => void
}) {
  const { t } = useTranslation('artifact')
  const database = useDatabase()
  const artValuesDirty = useDataManagerValues(database.arts)
  const dupList = useMemo(() => {
    const dups = [] as Array<Array<string>>
    let artKeys = artValuesDirty && [...database.arts.keys]

    while (artKeys.length !== 0) {
      const artKey = artKeys.shift()
      if (!artKey) continue
      const art = database.arts.get(artKey)
      if (!art) continue
      const { duplicated } = database.arts.findDups(art, artKeys)
      if (!duplicated.length) continue
      const dupKeys = duplicated.map((a) => a.id)

      dups.push(
        [artKey, ...dupKeys]
          // sort the keys so equipped artifacts show up 1st.
          .sort((a) => ((database.arts.get(a)?.location ?? '') ? -1 : 1))
      )
      artKeys = artKeys.filter((id) => !dupKeys.includes(id))
    }
    return dups
  }, [database.arts, artValuesDirty])
  return (
    <Stack spacing={2}>
      {dupList.map((dups) => (
        <CardThemed key={dups.join()} sx={{ overflowX: 'scroll' }}>
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            {dups.map((dup) => (
              <Box key={dup} sx={{ minWidth: 300 }}>
                <ArtifactCard
                  artifactId={dup}
                  setLocation={(location) =>
                    database.arts.set(dup, { location })
                  }
                  onLockToggle={() =>
                    database.arts.set(dup, ({ lock }) => ({ lock: !lock }))
                  }
                  onDelete={() => database.arts.remove(dup)}
                  onEdit={() => setArtifactIdToEdit(dup)}
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
