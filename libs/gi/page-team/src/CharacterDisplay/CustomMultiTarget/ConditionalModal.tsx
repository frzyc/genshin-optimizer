import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  type ArtifactSheet,
  CharacterSheet,
  type DocumentConditional,
  type DocumentSection,
  getArtSheet,
  getCharSheet,
  getWeaponSheet,
  WeaponSheet,
} from '@genshin-optimizer/gi/sheets'
import { CloseIcon, DocumentDisplay } from '@genshin-optimizer/gi/ui'
import { DashboardCustomize } from '@mui/icons-material'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

type SheetTuple = [string, ArtifactSheet | CharacterSheet | WeaponSheet]

export function ConditionalModal({ condCount }: { condCount: number }) {
  const database = useDatabase()
  const { t } = useTranslation('page_character')
  const { character } = useContext(CharacterContext)
  const [show, onShow, onCloseModal] = useBoolState(false)
  const weapon = database.weapons.get(character.equippedWeapon)!
  const arts = Object.values(character.equippedArtifacts)
    .map((artiId) => database.arts.get(artiId))
    .filter(notEmpty)
  const artSetCounts = arts.reduce(
    (counts, arti) => {
      counts[arti.setKey] = (counts[arti.setKey] ?? 0) + 1
      return counts
    },
    {} as Record<ArtifactSetKey, number>
  )

  const sheets: Record<'char' | 'wep' | 'art', SheetTuple[]> = {
    char: [[character.key, getCharSheet(character.key, database.gender)]],
    wep: [[weapon.key, getWeaponSheet(weapon.key)]],
    art: Object.entries(artSetCounts)
      .filter(([, count]) => count > 0)
      .map(([setKey]) => [setKey, getArtSheet(setKey)] as SheetTuple),
  }

  return (
    <>
      <Button color="info" onClick={onShow}>
        <Box display="flex" gap={1} alignItems="center">
          <span>{t('multiTarget.conditional.button')}</span>
          <SqBadge color={condCount ? 'success' : 'secondary'}>
            {condCount}
          </SqBadge>
        </Box>
      </Button>

      <ModalWrapper
        open={show}
        onClose={onCloseModal}
        containerProps={{ sx: { overflow: 'visible' } }}
      >
        <CardThemed bgt="light">
          <CardHeader
            title={
              <Box display="flex" gap={1} alignItems="center">
                <DashboardCustomize />
                <Typography variant="h6">
                  {t('multiTarget.conditional.title')}
                </Typography>
              </Box>
            }
            action={
              <IconButton onClick={onCloseModal}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {Object.entries(sheets).map(([key, sheetTuples]) => (
              <Box key={key}>
                <DocumentDisplay
                  sections={sheetTuples.flatMap(([sKey, sheet]) =>
                    sheetToDocumentSectrions(sheet, sKey, artSetCounts)
                  )}
                  columns={2}
                />
                <Divider sx={{ pb: 1 }} />
              </Box>
            ))}
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

function sheetToDocumentSectrions(
  sheet: ArtifactSheet | CharacterSheet | WeaponSheet,
  sheetKey: string,
  artSetCounts: Record<ArtifactSetKey, number>
) {
  if (sheet instanceof CharacterSheet) {
    return Object.values(sheet.talent)
      .flatMap((talent) => talent.sections)
      .filter(shouldDisplaySection)
  } else if (sheet instanceof WeaponSheet) {
    return sheet.document.filter(shouldDisplaySection)
  } else {
    // sheet instanceof ArtifactSheet
    return Object.entries(sheet.setEffects)
      .filter(
        ([setNum]) =>
          artSetCounts[sheetKey as ArtifactSetKey] >= Number.parseInt(setNum)
      )
      .flatMap(([, setEffect]) => setEffect.document)
      .filter(shouldDisplaySection)
  }
}

function shouldDisplaySection(
  section: DocumentSection
): section is DocumentConditional {
  return 'states' in section
}
