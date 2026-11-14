import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ImgIcon,
  ModalWrapper,
  TwoPcBonusList,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  type TwoPcStats,
  toggleInArr,
  valueString,
} from '@genshin-optimizer/common/util'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type {
  RelicCavernSetKey,
  RelicPlanarSetKey,
  StatKey,
} from '@genshin-optimizer/sr/consts'
import { allRelicCavernSetKeys } from '@genshin-optimizer/sr/consts'
import {
  cavernTwoPcGroups,
  cavernTwoPcSets,
  planarTwoPcGroups,
  planarTwoPcSets,
} from '@genshin-optimizer/sr/stats'
import { RelicSetName, StatDisplay } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  MenuItem,
} from '@mui/material'
export function RelicSetFilter({
  disabled = false,
  setFilter4Cavern,
  setFilter2Cavern,
  setFilter2Planar,
  setSetFilter4Cavern,
  setSetFilter2Cavern,
  setSetFilter2Planar,
}: {
  disabled?: boolean
  setFilter4Cavern: RelicCavernSetKey[]
  setFilter2Cavern: RelicCavernSetKey[]
  setFilter2Planar: RelicPlanarSetKey[]
  setSetFilter4Cavern: (setFilter4Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Cavern: (setFilter2Cavern: RelicCavernSetKey[]) => void
  setSetFilter2Planar: (setFilter2Planar: RelicPlanarSetKey[]) => void
}) {
  const [open, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <ModalWrapper open={open} onClose={onClose}>
        <AdvSetFilterCard
          onClose={onClose}
          setFilter4Cavern={setFilter4Cavern}
          setSetFilter4Cavern={setSetFilter4Cavern}
        />
      </ModalWrapper>
      <CardContent sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
        {setFilter4Cavern.length <= 1 ? (
          <DropdownButton
            disabled={disabled}
            title={
              setFilter4Cavern[0] ? (
                <span>
                  Force 4-Set:{' '}
                  <strong>
                    <RelicSetName setKey={setFilter4Cavern[0]} />
                  </strong>
                </span>
              ) : (
                'Select to force 4-Set'
              )
            }
            sx={{ flexGrow: 1 }}
          >
            <MenuItem onClick={() => setSetFilter4Cavern([])}>
              No 4-Set
            </MenuItem>
            {allRelicCavernSetKeys.map((set) => (
              <MenuItem key={set} onClick={() => setSetFilter4Cavern([set])}>
                <RelicSetName setKey={set} />
              </MenuItem>
            ))}
          </DropdownButton>
        ) : (
          <Button disabled>
            <span>
              <strong>{setFilter4Cavern.length}</strong> Relic 4p-set Selected
            </span>
          </Button>
        )}
        <TwoPcBonusList
          title="Cavern 2-piece"
          groups={cavernTwoPcGroups}
          allowlist={setFilter2Cavern}
          universe={cavernTwoPcSets}
          onChange={setSetFilter2Cavern}
          disabled={disabled}
          resetLabel="Reset"
          label={(group) => (
            <TwoPcStatLabel stats={group.stats} setKey={group.sets[0]} />
          )}
        />
        <TwoPcBonusList
          title="Planar 2-piece"
          groups={planarTwoPcGroups}
          allowlist={setFilter2Planar}
          universe={planarTwoPcSets}
          onChange={setSetFilter2Planar}
          disabled={disabled}
          resetLabel="Reset"
          label={(group) => (
            <TwoPcStatLabel stats={group.stats} setKey={group.sets[0]} />
          )}
        />
        <Box>
          <Button disabled={disabled} onClick={onOpen} color="info">
            Advanced 4-Set Config
          </Button>
        </Box>
      </CardContent>
    </CardThemed>
  )
}

function AdvSetFilterCard({
  onClose,
  setFilter4Cavern,
  setSetFilter4Cavern,
}: {
  onClose: () => void
  setFilter4Cavern: RelicCavernSetKey[]
  setSetFilter4Cavern: (setFilter4Cavern: RelicCavernSetKey[]) => void
}) {
  return (
    <CardThemed>
      <CardHeader
        title="Advanced 4-Set Config"
        action={
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            disabled={!setFilter4Cavern.length}
            onClick={() => setSetFilter4Cavern([])}
          >
            Reset 4p filter
          </Button>
        </Box>
        <Grid container spacing={1}>
          {allRelicCavernSetKeys.map((set) => (
            <Grid key={set} size={{ xs: 12, sm: 6, md: 4 }}>
              <CardThemed bgt="light">
                <CardHeader
                  title={<RelicSetName setKey={set} />}
                  avatar={
                    <ImgIcon
                      src={relicAsset(set, getDefaultRelicSlot(set))}
                      size={2}
                    />
                  }
                />
                <Button
                  fullWidth
                  color={
                    !setFilter4Cavern.length || setFilter4Cavern.includes(set)
                      ? 'success'
                      : 'secondary'
                  }
                  onClick={() =>
                    setSetFilter4Cavern(
                      setFilter4Cavern.length
                        ? toggleInArr([...setFilter4Cavern], set)
                        : [set]
                    )
                  }
                >
                  Allow 4p
                </Button>
              </CardThemed>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}

function TwoPcStatLabel({
  stats,
  setKey,
}: {
  stats?: TwoPcStats
  setKey: RelicCavernSetKey | RelicPlanarSetKey
}) {
  if (!stats) return <RelicSetName setKey={setKey} />
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
      }}
    >
      {Object.entries(stats).map(([stat, value]) => (
        <Box
          key={stat}
          component="span"
          sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}
        >
          <StatDisplay statKey={stat as StatKey} showPercent />+
          {valueString(value, getUnitStr(stat))}
        </Box>
      ))}
    </Box>
  )
}
