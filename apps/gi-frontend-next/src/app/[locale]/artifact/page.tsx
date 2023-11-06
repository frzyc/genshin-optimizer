'use client'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { CardContent, CardHeader, Divider } from '@mui/material'
import AddArtButton from './components/AddArtButton'
import ArtifactList from './components/ArtifactList'

export default function ArtifactPage() {
  return (
    <CardThemed>
      <CardHeader title="Artifact Page" action={<AddArtButton />} />
      <Divider />
      <CardContent>
        <ArtifactList />
      </CardContent>
    </CardThemed>
  )
}
