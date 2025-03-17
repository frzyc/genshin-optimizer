import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ModalWrapper, NumberInputLazy } from '@genshin-optimizer/common/ui'
import {
  useCharacterContext,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
export function EnemyCard() {
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { enemyLvl, enemyDef, enemyisStunned } = charOpt
  const [show, onShow, onClose] = useBoolState()
  return (
    <ZCard>
      <EnemyEditor show={show} onClose={onClose} />
      <CardActionArea onClick={onShow} sx={{ borderRadius: 0 }}>
        <CardContent>
          <Typography
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
          >
            <span>Enemy Lvl: {enemyLvl}</span>
            <span>DEF: {enemyDef}</span>
            <span>{enemyisStunned ? 'Stunned' : 'Not Stunned'}</span>
          </Typography>
        </CardContent>
      </CardActionArea>
    </ZCard>
  )
}
function EnemyEditor({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { enemyLvl, enemyDef, enemyisStunned } = charOpt
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <ZCard>
        <CardHeader
          title="Enemy Editor"
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Stack spacing={1}>
            <NumberInputLazy
              label="Enemy Lvl"
              value={enemyLvl}
              inputProps={{ min: 0 }}
              onChange={(v) =>
                database.charOpts.set(character.key, { enemyLvl: v })
              }
            />
            <NumberInputLazy
              label="Enemy DEF"
              value={enemyDef}
              inputProps={{ min: 0 }}
              onChange={(v) =>
                database.charOpts.set(character.key, { enemyDef: v })
              }
            />
            <Button
              onClick={() =>
                database.charOpts.set(character.key, {
                  enemyisStunned: !enemyisStunned,
                })
              }
              color={enemyisStunned ? 'success' : 'secondary'}
            >
              {enemyisStunned ? 'Stunned' : 'Not Stunned'}
            </Button>
          </Stack>
        </CardContent>
      </ZCard>
    </ModalWrapper>
  )
}
