import { faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ExpandMore } from "@mui/icons-material";
import { Button, CardContent, Chip, Collapse, Grid, Typography } from "@mui/material";
import { useCallback, useState } from 'react';
import Character from "../Character/Character";
import StatInput from "../Character/StatInput";
import useCharacterReducer from "../ReactHooks/useCharacterReducer";
import Stat from "../Stat";
import { ICachedCharacter } from "../Types/character";
import { allElements, ElementKey } from "../Types/consts";
import { characterBaseStats } from "../Util/StatUtil";
import CardLight from "./Card/CardLight";
import ColorText from "./ColoredText";
import ExpandButton from "./ExpandButton";
import { uncoloredEleIcons } from "./StatIcon";

export function EnemyExpandCard({ character }) {
  const [expanded, setexpanded] = useState(false)
  const toggle = useCallback(() => setexpanded(!expanded), [setexpanded, expanded])
  return <CardLight>
    <CardContent>
      <Grid container>
        <Grid item flexGrow={1} alignItems="center">
          <Grid container spacing={1}>
            <Grid item>
              <Chip size="small" color="success" label={<span>{Stat.getStatName("enemyLevel")} <strong>{Character.getStatValueWithBonus(character, "enemyLevel")}</strong></span>} />
            </Grid>
            {["physical", ...allElements].map(element => <Grid item key={element}>
              <Typography key={element} ><EnemyResText element={element} character={character} /></Typography>
            </Grid>)}
            <Grid item>
              <Typography>DEF Reduction {Character.getStatValueWithBonus(character, "enemyDEFRed_")}%</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <ExpandButton
            expand={expanded}
            onClick={toggle}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
            sx={{ p: 0 }}
          >
            <ExpandMore />
          </ExpandButton>
        </Grid>
      </Grid>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        <EnemyEditor character={character} />
      </CardContent>
    </Collapse>
  </CardLight>
}

export function EnemyResText({ character, element }: { character: ICachedCharacter, element: string }) {
  const immune = !!Character.getStatValueWithBonus(character, `${element}_enemyImmunity`)
  const resKey = `${element}_enemyRes_`
  const content = immune ? <span >{uncoloredEleIcons[element]} IMMUNE</span> :
    <span >{uncoloredEleIcons[element]}RES <strong>{Character.getStatValueWithBonus(character, resKey)}%</strong></span>
  return <ColorText color={element}>{content}</ColorText>
}


export function EnemyEditor({ character, character: { key: characterKey, }, bsProps = { xs: 12, md: 6 } }: { character: ICachedCharacter, bsProps?: object }) {
  const characterDispatch = useCharacterReducer(characterKey)
  const charBaseStats = characterBaseStats(character)
  return <Grid container spacing={1}>
    <Grid item {...bsProps}>
      <Button fullWidth sx={{ height: "100%" }} size="small" component="a" color="warning" href="https://genshin-impact.fandom.com/wiki/Resistance#Base_Enemy_Resistances" target="_blank" rel="noreferrer">
        To get the specific resistance values of enemies, please visit the wiki.
      </Button>
    </Grid>
    <Grid item {...bsProps}>
      <StatInput
        sx={{ bgcolor: t => t.palette.contentLight.main, width: "100%" }}
        name={<b>Enemy Level</b>}
        value={Character.getStatValueWithBonus(character, "enemyLevel")}
        placeholder={Stat.getStatNameRaw("enemyLevel")}
        defaultValue={charBaseStats.enemyLevel}
        onValueChange={value => characterDispatch({ type: "bonusStats", statKey: "enemyLevel", value })}
      />
    </Grid>
    {(["physical", ...allElements] as Array<ElementKey | "physical">).map(eleKey => {
      let statKey = `${eleKey}_enemyRes_`
      let immunityStatKey = `${eleKey}_enemyImmunity`
      let elementImmunity = Character.getStatValueWithBonus(character, immunityStatKey)
      return <Grid item key={eleKey} {...bsProps}>
        <StatInput
          sx={{ bgcolor: t => t.palette.contentLight.main, width: "100%" }}
          name={<b>{Stat.getStatName(statKey)}</b>}
          value={Character.getStatValueWithBonus(character, statKey)}
          placeholder={Stat.getStatNameRaw(statKey)}
          defaultValue={charBaseStats[statKey]}
          onValueChange={value => characterDispatch({ type: "bonusStats", statKey, value })}
          disabled={elementImmunity}
          percent
        >
          <Button color={eleKey} onClick={() => characterDispatch({ type: "bonusStats", statKey: immunityStatKey, value: !elementImmunity })} >
            <FontAwesomeIcon icon={elementImmunity ? faCheckSquare : faSquare} className="fa-fw" /> Immunity
          </Button>
        </StatInput>
      </Grid>
    })}
    <Grid item {...bsProps}>
      <StatInput
        sx={{ bgcolor: t => t.palette.contentLight.main, width: "100%" }}
        name={<b>{Stat.getStatName("enemyDEFRed_")}</b>}
        value={Character.getStatValueWithBonus(character, "enemyDEFRed_")}
        placeholder={Stat.getStatNameRaw("enemyDEFRed_")}
        defaultValue={charBaseStats["enemyDEFRed_"]}
        onValueChange={value => characterDispatch({ type: "bonusStats", statKey: "enemyDEFRed_", value })}
        percent
      />
    </Grid>
    <Grid item xs={12}>
      <small>Note: Genshin Impact halves resistance shred values below 0%. For the sake of calculations enter the RAW value and GO will do the rest. (e.g. 10% - 20% = -10%)</small>
    </Grid>
  </Grid>
}