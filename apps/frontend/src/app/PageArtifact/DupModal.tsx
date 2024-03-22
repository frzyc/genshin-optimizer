import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
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
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CardDark from '../Components/Card/CardDark'
import ModalWrapper from '../Components/ModalWrapper'
import ArtifactCard from './ArtifactCard'
export default function DupModal({ show, onHide }) {
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
              {t`showDup`}
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
          <DupContent />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function DupContent() {
  const { t } = useTranslation('artifact')
  const database = useDatabase()
  const [dbDirty, setDBDirty] = useForceUpdate()
  useEffect(() => database.arts.followAny(setDBDirty), [setDBDirty, database])

  const dupList = useMemo(() => {
    const dups = dbDirty && ([] as Array<Array<string>>)
    let artKeys = database.arts.keys

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
          .sort((a) => (database.arts.get(a)?.location ?? '' ? -1 : 1))
      )
      artKeys = artKeys.filter((id) => !dupKeys.includes(id))
    }
    return dups
  }, [database, dbDirty])
  const editorProps = useMemo(() => ({}), [])
  return (
    <Stack spacing={2}>
      {dupList.map((dups) => (
        <CardDark key={dups.join()} sx={{ overflowX: 'scroll' }}>
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            {dups.map((dup) => (
              <Box key={dup} sx={{ minWidth: 300 }}>
                <ArtifactCard
                  artifactId={dup}
                  canEquip
                  onDelete={() => database.arts.remove(dup)}
                  editorProps={editorProps}
                />
              </Box>
            ))}
          </CardContent>
        </CardDark>
      ))}
      {!dupList.length && (
        <Alert variant="filled" severity="success">{t`noDupAlert`}</Alert>
      )}
    </Stack>
  )
}
