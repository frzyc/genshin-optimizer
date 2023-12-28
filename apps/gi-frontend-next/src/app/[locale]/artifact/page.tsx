'use client'
import { CardThemed } from '@genshin-optimizer/ui-common'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
} from '@mui/material'
import AddArtButton from './components/AddArtButton'
import ArtifactList from './components/ArtifactList'
import { useState } from 'react'
import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'
import { columns } from './util'

import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import { ArtifactEditor } from '@genshin-optimizer/gi-ui-next'

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
