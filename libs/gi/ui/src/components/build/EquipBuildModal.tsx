'use client'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
  useWeapon,
} from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
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
import type { ReactNode } from 'react'
import { useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { dataContextObj } from '../../context'
import { DataContext } from '../../context'
import { useCharData, useTeamData } from '../../hooks'
import type { TeamData } from '../../type'
import { ArtifactCardNano } from '../artifact'
import { StatDisplayComponent } from '../character'
import { WeaponCardNano } from '../weapon'
type Props = {
  currentName: string
  currentWeaponId: string | undefined
  currentArtifactIds: Record<ArtifactSlotKey, string | undefined>
  newWeaponId: string | undefined
  newArtifactIds: Record<ArtifactSlotKey, string | undefined>
  onEquip: () => void
  onHide: () => void
}
export function EquipBuildModal(props: Props & { show: boolean }) {
  const { show, onHide } = props
  /* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it https://github.com/frzyc/genshin-optimizer/issues/1498*/
  return (
    <ModalWrapper
      open={show}
      onClose={onHide}
      containerProps={{ maxWidth: 'xl' }}
    >
      <Content {...props} />
    </ModalWrapper>
  )
}
function Content(props: Props) {
  const { t } = useTranslation('build')
  const {
    currentName,
    currentWeaponId,
    currentArtifactIds,
    newWeaponId,
    newArtifactIds,
    onHide,
    onEquip,
  } = props
  const [name, setName] = useState('')
  const [copyCurrent, setCopyCurrent] = useState(false)

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
          name !== '' ? name : t('equipBuildModal.newName', { currentName }),
        artifactIds: currentArtifactIds,
        weaponId: currentWeaponId,
      })
    }

    onEquip()
    setName('')
    setCopyCurrent(false)
    onHide()
  }

  // conditionals for the changed artifact (opacity)
  const isWeaponChanged = currentWeaponId !== newWeaponId
  const isArtifactChanged = (slotKey: ArtifactSlotKey) =>
    currentArtifactIds[slotKey] !== newArtifactIds[slotKey]

  return (
    <CardThemed>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CheckroomIcon />
            <span>
              <Trans t={t} i18nKey={'equipBuildModal.title'}>
                Confirm Equipment Changes for{' '}
                <strong>{{ currentName } as any}</strong>
              </Trans>
            </span>
          </Box>
        }
        action={
          <IconButton onClick={onHide}>
            <CloseIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Confirmation Message */}
        <Typography sx={{ fontSize: 20 }}>
          {t('equipBuildModal.desc')}
        </Typography>
        {teamCharId && (
          <FormControlLabel
            label={
              <Trans t={t} i18nKey={'equipBuildModal.overwrite'}>
                Copy the current equipment in{' '}
                <strong>{{ currentName } as any}</strong> to a new build.
                Otherwise, they will be overwritten.
              </Trans>
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
            label={t('equipBuildModal.label')}
            placeholder={t('equipBuildModal.newName', { currentName })}
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
          <Button color="error" onClick={onHide}>
            {t('equipBuildModal.cancel')}
          </Button>
          <Button color="success" onClick={toEquip}>
            {t('equipBuildModal.equip')}
          </Button>
        </Box>
        {/* Active Build */}
        <CardThemed bgt="light">
          <CardContent
            sx={{
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
                <CardThemed
                  sx={{
                    height: '100%',
                    maxHeight: '8em',
                    opacity: isWeaponChanged ? 1 : 0.5,
                  }}
                >
                  <WeaponCardNano
                    weaponId={currentWeaponId}
                    weaponTypeKey={weaponTypeKey}
                    showLocation
                  />
                </CardThemed>
              </Grid>
              {Object.entries(currentArtifactIds).map(([slotKey, id]) => (
                <Grid item key={id || slotKey} xs={1}>
                  <CardThemed
                    sx={{
                      height: '100%',
                      maxHeight: '8em',
                      opacity: isArtifactChanged(slotKey as ArtifactSlotKey)
                        ? 1
                        : 0.5,
                    }}
                  >
                    <ArtifactCardNano
                      artifactId={id}
                      slotKey={slotKey}
                      showLocation
                    />
                  </CardThemed>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </CardThemed>
        <Box
          flexGrow={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            height: 0,
            my: -0.5,
          }}
        >
          <KeyboardDoubleArrowDownIcon
            sx={{ fontSize: `5em`, zIndex: 1, opacity: 0.85 }}
          />
        </Box>
        {/* New Build */}
        <CardThemed bgt="light">
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
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
                <CardThemed
                  sx={{
                    height: '100%',
                    maxHeight: '8em',
                    opacity: isWeaponChanged ? 1 : 0.5,
                  }}
                >
                  <WeaponCardNano
                    weaponId={newWeaponId}
                    weaponTypeKey={weaponTypeKey}
                    showLocation
                  />
                </CardThemed>
              </Grid>
              {Object.entries(newArtifactIds).map(([slotKey, id]) => (
                <Grid item key={id || slotKey} xs={1}>
                  <CardThemed
                    sx={{
                      height: '100%',
                      maxHeight: '8em',
                      opacity: isArtifactChanged(slotKey as ArtifactSlotKey)
                        ? 1
                        : 0.5,
                    }}
                  >
                    <ArtifactCardNano
                      artifactId={id}
                      slotKey={slotKey}
                      showLocation
                    />
                  </CardThemed>
                </Grid>
              ))}
            </Grid>
            <DataWrapper {...props}>
              <StatDisplayComponent columns={{ xs: 1, sm: 2, md: 3 }} />
            </DataWrapper>
          </CardContent>
        </CardThemed>
      </CardContent>
    </CardThemed>
  )
}
function DataWrapper(props: Props & { children: ReactNode }) {
  const { children, ...rest } = props
  const { teamId } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  if (teamId) return <TeamDataWrapper {...props}>{children}</TeamDataWrapper>
  if (characterKey)
    return <CharacterDataWrapper {...rest}>{children}</CharacterDataWrapper>
  return null
}
function useArtifacts(
  artifacts: Record<ArtifactSlotKey, string | undefined> | undefined
) {
  const database = useDatabase()
  return useMemo(
    () =>
      artifacts
        ? Object.values(artifacts)
            .filter(notEmpty)
            .map((id) => database.arts.get(id))
            .filter(notEmpty)
        : undefined,
    [database, artifacts]
  )
}
function TeamDataWrapper(props: Props & { children: ReactNode }) {
  const { children, ...rest } = props
  const {
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const curArtifacts = useArtifacts(rest.currentArtifactIds)
  const newArtifacts = useArtifacts(rest.newArtifactIds)
  const curWeapon = useWeapon(rest.currentWeaponId)
  const newWeapon = useWeapon(rest.newWeaponId)
  const curData = useTeamData(0, curArtifacts, curWeapon)
  const newData = useTeamData(0, newArtifacts, newWeapon)

  const value = useMemo(() => {
    const data = newData?.[characterKey]?.target
    return (
      data &&
      ({
        data: data,
        compareData: curData?.[characterKey]?.target,
        teamData: newData,
      } as dataContextObj)
    )
  }, [newData, characterKey, curData])
  if (!value) return
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

function CharacterDataWrapper(
  props: Props & { children: ReactNode; currentData?: TeamData }
) {
  const { children, ...rest } = props
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const curArtifacts = useArtifacts(rest.currentArtifactIds)
  const newArtifacts = useArtifacts(rest.newArtifactIds)
  const curWeapon = useWeapon(rest.currentWeaponId)
  const newWeapon = useWeapon(rest.newWeaponId)
  const curData = useCharData(characterKey, 0, curArtifacts, curWeapon)
  const newData = useCharData(characterKey, 0, newArtifacts, newWeapon)

  const value = useMemo(() => {
    const data = newData?.[characterKey]?.target
    return (
      data &&
      ({
        data: data,
        compareData: curData?.[characterKey]?.target,
        teamData: newData,
      } as dataContextObj)
    )
  }, [newData, characterKey, curData])
  if (!value) return
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
