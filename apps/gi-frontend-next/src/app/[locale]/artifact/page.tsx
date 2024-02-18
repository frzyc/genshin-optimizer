'use client'
import { CardThemed } from '@genshin-optimizer/common/ui'
import type { Artifact } from '@genshin-optimizer/gi/frontend-gql'
import { ArtifactEditor } from '@genshin-optimizer/gi/ui-next'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddArtButton from './components/AddArtButton'
import ArtifactList from './components/ArtifactList'
import { columns } from './util'

export default function ArtifactPage() {
  const { t } = useTranslation(['artifact', 'ui'])
  const [editArt, setEditArt] = useState(
    undefined as undefined | Partial<Artifact>
  )
  const onShowEditor = () => setEditArt({})
  return (
    <>
      <Stack spacing={1}>
        <CardThemed>
          <CardHeader title="Artifact Page" action={<AddArtButton />} />
          <Divider />
          <CardContent></CardContent>
        </CardThemed>
        <Box>
          <Grid container columns={columns} spacing={1}>
            <Grid item xs>
              <>
                <Button
                  fullWidth
                  onClick={onShowEditor}
                  color="info"
                  startIcon={<AddIcon />}
                >{t`addNew`}</Button>
                <ArtifactEditor artifact={editArt} />
              </>
            </Grid>
            {/* <Grid item xs={1}>
            <Button
              fullWidth
              onClick={onShowDup}
              color="info"
              startIcon={<DifferenceIcon />}
            >{t`showDup`}</Button>
          </Grid> */}
          </Grid>
        </Box>
        <ArtifactList setEditArt={setEditArt} />
      </Stack>
    </>
  )
}
