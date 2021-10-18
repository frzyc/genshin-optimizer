import { Button, CardContent, Divider, Grid, MenuItem, MenuList, styled, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import Character from '../../Character/Character';
import CharacterSheet from '../../Character/CharacterSheet';
import { getFormulaTargetsDisplayHeading } from '../../Character/CharacterUtil';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import ColorText from '../../Components/ColoredText';
import ModalWrapper from '../../Components/ModalWrapper';
import Formula from '../../Formula';
import usePromise from '../../ReactHooks/usePromise';
import Stat from '../../Stat';
import { IFieldDisplay } from '../../Types/IFieldDisplay';
import { ICalculatedStats } from '../../Types/stats';
import WeaponSheet from '../../Weapon/WeaponSheet';

const WhiteButton = styled(Button)({
  color: "black",
  backgroundColor: "white",
  "&:hover": {
    backgroundColor: "#e1e1e1",
  }
})
export default function OptimizationTargetSelector({ optimizationTarget, setTarget, initialStats, characterSheet, weaponSheet, artifactSheets, statsDisplayKeys, disabled = false }: {
  optimizationTarget: string | string[], setTarget: (target: string | string[]) => void, initialStats: ICalculatedStats, characterSheet: CharacterSheet, weaponSheet: WeaponSheet, artifactSheets, statsDisplayKeys: { basicKeys: any, [key: string]: any }, disabled
}) {
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => !disabled && setOpen(true), [setOpen, disabled])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  const formula = usePromise(Array.isArray(optimizationTarget) ? Formula.get(optimizationTarget) : undefined, [optimizationTarget])

  const setTargetHandler = useCallback(
    (target) => {
      onClose()
      setTarget(target)
    },
    [onClose, setTarget],
  )
  const sortByText = useMemo(() => {
    if (Array.isArray(optimizationTarget)) {
      if (!formula) return null
      let [type, , talentKey] = (formula as any).keys as string[]
      const field = (formula as any).field as IFieldDisplay
      const variant = Character.getTalentFieldValue(field, "variant", initialStats)
      const text = Character.getTalentFieldValue(field, "text", initialStats)
      if (type === "character") {
        if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") talentKey = "auto"
        return <b>{characterSheet?.getTalentOfKey(talentKey, initialStats?.characterEle)?.name}: <ColorText color={variant} >{text}</ColorText></b>
      } else if (type === "weapon") {
        return <b>{weaponSheet?.name}: <ColorText color={variant} >{text}</ColorText></b>
      }
    } else return <b>Basic Stat: <span className={`text-${Stat.getStatVariant(optimizationTarget)}`}>{Stat.getStatNameWithPercent(optimizationTarget)}</span></b>
  }, [optimizationTarget, formula, initialStats, characterSheet, weaponSheet])

  return <><WhiteButton onClick={onOpen} disabled={disabled} >
    <span>Optimization Target: {sortByText}</span>
  </WhiteButton>
    <ModalWrapper open={open} onClose={onClose}>
      <CardDark >
        <CardContent>
          <Grid container spacing={1}>
            {!!statsDisplayKeys && Object.entries(statsDisplayKeys).map(([sectionKey, fields]) => {
              const header = (characterSheet && weaponSheet && artifactSheets) ? getFormulaTargetsDisplayHeading(sectionKey as string, { characterSheet, weaponSheet, artifactSheets }, initialStats?.characterEle) : sectionKey
              return <Grid item xs={6} md={4} key={sectionKey as string}>
                <CardLight sx={{ height: "100%" }}>
                  <CardContent sx={{ py: 1 }}>
                    <Typography>
                      <b>{header as string}</b>
                    </Typography>

                  </CardContent>
                  <Divider />
                  <MenuList>
                    {fields.map((target, i) => {
                      if (Array.isArray(target))
                        return <TargetSelectorMenuItem key={i} {...{ target, setTarget: setTargetHandler, initialStats }} />
                      else if (typeof target === "string")
                        return <MenuItem key={i} onClick={() => setTargetHandler(target)}>{Stat.getStatNameWithPercent(target)}</MenuItem>
                      return null
                    })}
                  </MenuList>
                </CardLight>
              </Grid>
            })}
          </Grid>
        </CardContent>
      </CardDark>
    </ModalWrapper>
  </>
}
function TargetSelectorMenuItem({ target, setTarget, initialStats }) {
  const formula = usePromise(Formula.get(target), [target])
  if (!formula) return null
  const talentField = (formula as any).field as IFieldDisplay
  return <MenuItem onClick={() => setTarget(target)} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
    <ColorText color={Character.getTalentFieldValue(talentField, "variant", initialStats)} >{Character.getTalentFieldValue(talentField, "text", initialStats)}</ColorText>
  </MenuItem>
}