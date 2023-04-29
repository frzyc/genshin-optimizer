import {
  Alert,
  Box,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import CloseButton from '../Components/CloseButton'
import ModalWrapper from '../Components/ModalWrapper'
import { DatabaseContext } from '../Database/Database'
import useForceUpdate from '../ReactHooks/useForceUpdate'
import ArtifactCard from './ArtifactCard'
import DifferenceIcon from '@mui/icons-material/Difference'
export default function DupModal({ show, onHide }) {
  const { t } = useTranslation('artifact')
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardLight>
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" flexGrow={1}>
            <DifferenceIcon sx={{ verticalAlign: 'text-top', mr: 1 }} />
            {t`showDup`}
          </Typography>
          <CloseButton onClick={onHide} />
        </CardContent>
        <Divider />
        <CardContent>
          <DupContent />
        </CardContent>
      </CardLight>
    </ModalWrapper>
  )
}
function DupContent() {
  const { t } = useTranslation('artifact')
  const { database } = useContext(DatabaseContext)
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
