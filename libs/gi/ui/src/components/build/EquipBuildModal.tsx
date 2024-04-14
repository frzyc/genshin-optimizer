import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useState } from 'react'
import { ArtifactCardNano } from '../artifact'
import { WeaponCardNano } from '../weapon'

type EquipChangeProps = {
  currentName: string
  currentWeapon: string | undefined
  currentArtifacts: Record<ArtifactSlotKey, string | undefined>
  newWeapon: string | undefined
  newArtifacts: Record<ArtifactSlotKey, string | undefined>
}

export function EquipBuildModal({
  equipChangeProps,
  showPrompt,
  OnHidePrompt,
  onEquip,
}: {
  equipChangeProps: EquipChangeProps
  showPrompt: boolean
  onEquip: () => void
  OnHidePrompt: () => void
}) {
  const [name, setName] = useState('')
  const [copyCurrent, setCopyCurrent] = useState(false)
  // const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()

  const database = useDatabase()
  const { teamCharId } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const weaponTypeKey = getCharStat(characterKey).weaponType

  const toEquip = () => {
    if (copyCurrent) {
      database.teamChars.newBuild(teamCharId, {
        name:
          name !== '' ? name : `Duplicate of ${equipChangeProps.currentName}`,
        artifactIds: equipChangeProps.currentArtifacts,
        weaponId: equipChangeProps.currentWeapon,
      })
    }

    onEquip()
    setName('')
    setCopyCurrent(false)
    OnHidePrompt()
  }

  /* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */
  /* TODO: Translation */
  return (
    <ModalWrapper open={showPrompt} onClose={OnHidePrompt}>
      <CardThemed>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <CheckroomIcon />
              <span>
                Confirm Equipment Changes for{' '}
                <strong>{equipChangeProps.currentName}</strong>
              </span>
            </Box>
          }
          action={
            <IconButton onClick={OnHidePrompt}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box>
            {/* Active Build */}
            <CardThemed bgt="light">
              <Box sx={{ pl: 2, pt: 2 }}>
                <SqBadge color="success">Current Equipment</SqBadge>
              </Box>
              <CardContent
                sx={{
                  pt: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'stretch',
                }}
              >
                <Grid
                  container
                  spacing={1}
                  columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}
                >
                  <Grid item xs={1}>
                    <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
                      <WeaponCardNano
                        weaponId={equipChangeProps.currentWeapon}
                        weaponTypeKey={weaponTypeKey}
                      />
                    </CardThemed>
                  </Grid>
                  {Object.entries(equipChangeProps.currentArtifacts).map(
                    ([slotKey, id]) => (
                      <Grid item key={id || slotKey} xs={1}>
                        <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
                          <ArtifactCardNano artifactId={id} slotKey={slotKey} />
                        </CardThemed>
                      </Grid>
                    )
                  )}
                </Grid>
              </CardContent>
            </CardThemed>
            <Box
              flexGrow={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
              padding={2}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
            </Box>
            {/* New Build */}
            <CardThemed bgt="light">
              <Box sx={{ pl: 2, pt: 2 }}>
                <SqBadge color="success">New Equipment</SqBadge>
              </Box>
              <CardContent
                sx={{
                  pt: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'stretch',
                }}
              >
                <Grid
                  container
                  spacing={1}
                  columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}
                >
                  <Grid item xs={1}>
                    <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
                      <WeaponCardNano
                        weaponId={equipChangeProps.newWeapon}
                        weaponTypeKey={weaponTypeKey}
                      />
                    </CardThemed>
                  </Grid>
                  {Object.entries(equipChangeProps.newArtifacts).map(
                    ([slotKey, id]) => (
                      <Grid item key={id || slotKey} xs={1}>
                        <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
                          <ArtifactCardNano artifactId={id} slotKey={slotKey} />
                        </CardThemed>
                      </Grid>
                    )
                  )}
                </Grid>
              </CardContent>
            </CardThemed>
          </Box>
        </CardContent>
        <CardContent sx={{ pt: '0', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 20 }}>
            Do you want to make the changes shown above?
          </Typography>
          {teamCharId && (
            <FormControlLabel
              label={
                <>
                  Copy the current equipment in{' '}
                  <strong>{equipChangeProps.currentName}</strong> to a new
                  build. Otherwise, they will be overwritten.
                </>
              }
              control={
                <Checkbox
                  checked={copyCurrent}
                  onChange={(event) => setCopyCurrent(event.target.checked)}
                  color={copyCurrent ? 'success' : 'secondary'}
                />
              }
            />
          )}
          {copyCurrent && (
            <TextField
              label="Build Name"
              placeholder={`Duplicate of ${equipChangeProps.currentName}`}
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
              marginTop: 4,
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
