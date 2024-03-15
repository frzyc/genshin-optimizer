import {
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { Checkroom, KeyboardArrowDown } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
} from '@mui/material'
import { useContext, useState } from 'react'
import ArtifactCardNano from '../../../Components/Artifact/ArtifactCardNano'
import CloseButton from '../../../Components/CloseButton'
import WeaponCardNano from '../../../Components/Weapon/WeaponCardNano'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'

type CurrentNewBuildProps = {
  currentWeapon: string | undefined
  currentArtifacts: Record<ArtifactSlotKey, string | undefined>
  newWeapon: string | undefined
  newArtifacts: Record<ArtifactSlotKey, string | undefined>
}

export default function EquipBuildModal({
  buildProps,
  showPrompt,
  OnHidePrompt,
  onEquip,
}: {
  buildProps: CurrentNewBuildProps
  showPrompt: boolean
  onEquip: () => void
  OnHidePrompt: () => void
}) {
  const [name, setName] = useState('')
  const [copyEquipped, setCopyEquipped] = useState(false)
  // const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()

  const database = useDatabase()
  const {
    teamCharId,
    teamChar: { key: characterKey },
   } = useContext(TeamCharacterContext)
  const weaponTypeKey = getCharData(characterKey).weaponType

  const toEquip = () => {
    if (copyEquipped) {
      database.teamChars.newBuild(teamCharId, {
        name: name !== '' ? name : 'Duplicate of Equipped',
        artifactIds: buildProps.currentArtifacts,
        weaponId: buildProps.currentWeapon,
      })
    }

    onEquip()
    setName('')
    setCopyEquipped(false)
    OnHidePrompt()
  }

  /* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */
  /* TODO: Translation */
  return (
    <ModalWrapper
      open={showPrompt}
      onClose={OnHidePrompt}
    >
      <CardThemed>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Checkroom />
              <span>Preview Build Changes</span>
            </Box>
          }
          action={<CloseButton onClick={OnHidePrompt} />}
        />
        <Divider />
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Grid
            container
            spacing={1}
            columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}
          >
            {/* Active Build */}
            <CardThemed bgt='light'>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'stretch',
                }}
              >
                <Grid item xs={1}>
                  <WeaponCardNano
                    weaponId={buildProps.currentWeapon}
                    weaponTypeKey={weaponTypeKey}
                  />
                </Grid>
                {Object.entries(buildProps.currentArtifacts).map(([slotKey, id]) => (
                  <Grid item key={id || slotKey} xs={1}>
                    <ArtifactCardNano
                      artifactId={id}
                      slotKey={slotKey}
                    />
                  </Grid>
                ))}
              </CardContent>
            </CardThemed>
            <Box
              flexGrow={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
              padding={2}
            >
              <KeyboardArrowDown sx={{ fontSize: 40 }} />
            </Box>
            {/* New Build */}
            <CardThemed bgt='light'>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'stretch',
                }}
              >
                <Grid item xs={1}>
                  <WeaponCardNano
                    weaponId={buildProps.newWeapon}
                    weaponTypeKey={weaponTypeKey}
                  />
                </Grid>
                {Object.entries(buildProps.newArtifacts).map(([slotKey, id]) => (
                  <Grid item key={id || slotKey} xs={1}>
                    <ArtifactCardNano
                      artifactId={id}
                      slotKey={slotKey}
                    />
                  </Grid>
                ))}
              </CardContent>
            </CardThemed>
          </Grid>
        </CardContent>
        <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <span>Do you want to equip all gear in this build to this character?</span>
          <FormControlLabel
            label="Copy my current equipment to a new build. Otherwise, the currently equipped build will be overwritten."
            control={
              <Checkbox
                checked={copyEquipped}
                onChange={(event) => setCopyEquipped(event.target.checked)}
                color={copyEquipped ? 'success' : 'secondary'}
              />
            }
          />
          {copyEquipped && (
            <TextField
              label="Build Name"
              placeholder="Duplicate of Equipped"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              sx={{ width: '75%', marginX: 4 }}
            />
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              marginTop: 8,
            }}
          >
            <Button color="error" onClick={OnHidePrompt}>
              Cancel
            </Button>
            <Button color="success" onClick={toEquip}>
              Equip
            </Button>
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
