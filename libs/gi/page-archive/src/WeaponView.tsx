import {
  CardThemed,
  ModalWrapper,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { weaponAsset } from '@genshin-optimizer/gi/assets'
import { getLevelString as getWeaponLevelString } from '@genshin-optimizer/gi/consts'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  FieldDisplayList,
  NodeFieldDisplay,
  WeaponDesc,
  WeaponName,
  WeaponPassiveDesc,
  WeaponPassiveName,
} from '@genshin-optimizer/gi/ui'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardContent,
  Grid,
  IconButton,
  ListItem,
  Typography,
} from '@mui/material'

export function WeaponView({
  show,
  weaponUIData,
  weapon,
  onClose,
}: {
  show: boolean
  weaponUIData: UIData
  weapon: IWeapon
  onClose?: () => void
}) {
  const { key, level = 0, refinement = 1, ascension = 0 } = weapon
  const weaponStat = key && getWeaponStat(key)

  const img = key ? weaponAsset(key, ascension >= 2) : ''

  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'md' }}
    >
      <CardThemed>
        <CardContent>
          {weaponStat && weaponUIData && (
            <Grid container spacing={1.5}>
              {/* Left column */}
              <Grid item xs={12} sm={3}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={12}>
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                      <Box
                        component="img"
                        src={img}
                        className={`grad-${weaponStat.rarity}star`}
                        sx={{
                          maxWidth: 256,
                          width: '100%',
                          height: 'auto',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={12}>
                    <Typography>
                      <small>{key && <WeaponDesc weaponKey={key} />}</small>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* right column */}
              <Grid
                item
                xs={12}
                sm={9}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Typography variant="h5">
                    <WeaponName weaponKey={key} />
                  </Typography>
                  {onClose && (
                    <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>
                <Typography>
                  Lv. {getWeaponLevelString(level, ascension)} R{refinement}
                </Typography>
                <StarsDisplay stars={weaponStat.rarity} />
                <Typography variant="subtitle1">
                  <strong>
                    {key && <WeaponPassiveName weaponKey={key} />}
                  </strong>
                </Typography>
                <Typography gutterBottom>
                  {key && (
                    <WeaponPassiveDesc
                      weaponKey={key}
                      refineIndex={
                        (weaponUIData.get(input.weapon.refinement).value ?? 1) -
                        1
                      }
                    />
                  )}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <CardThemed bgt="light">
                    <FieldDisplayList bgt="light">
                      {[
                        input.weapon.main,
                        input.weapon.sub,
                        input.weapon.sub2,
                      ].map((node) => {
                        const n = weaponUIData.get(node)
                        if (n.isEmpty || !n.value) return null
                        return (
                          <NodeFieldDisplay
                            key={JSON.stringify(n.info)}
                            calcRes={n}
                            component={ListItem}
                          />
                        )
                      })}
                    </FieldDisplayList>
                  </CardThemed>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
