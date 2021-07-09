import { faEdit, faGavel, faQuoteLeft, faSave } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useState } from "react"
import { Badge, Button, Card, Col, Dropdown, DropdownButton, Image, ListGroup, Row } from "react-bootstrap"
import Assets from "../../Assets/Assets"
import ConditionalDisplay from "../../Components/ConditionalDisplay"
import DocumentDisplay from "../../Components/DocumentDisplay"
import FieldDisplay from "../../Components/FieldDisplay"
import { Stars } from "../../Components/StarDisplay"
import StatDisplay from "../../Components/StatDisplay"
import { StatIconEle } from "../../Components/StatIcon"
import Conditional from "../../Conditional/Conditional"
import { LevelNameData } from "../../Data/WeaponData"
import Stat from "../../Stat"
import { ICharacter } from "../../Types/character"
import { allElements, allRarities } from "../../Types/consts"
import ICalculatedStats from "../../Types/ICalculatedStats"
import { IConditionals } from "../../Types/IConditional"
import statsToFields from "../../Util/FieldUtil"
import { usePromise } from "../../Util/ReactUtil"
import Weapon from "../../Weapon/Weapon"
import WeaponSheet from "../../Weapon/WeaponSheet"
import Character from "../Character"
import CharacterSheet from "../CharacterSheet"
import StatInput from "../StatInput"
type CharacterOverviewPaneProps = {
  characterSheet: CharacterSheet;
  weaponSheet: WeaponSheet
  editable: boolean;
  character: ICharacter
  characterDispatch: (any) => void
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}
export default function CharacterOverviewPane({ characterSheet, weaponSheet, editable, character, character: { constellation, level, ascension }, characterDispatch, equippedBuild, newBuild }: CharacterOverviewPaneProps) {
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  const { tlvl } = build
  const elementKey = build.characterEle
  const weaponTypeKey = characterSheet.weaponTypeKey
  return <Row>
    <Col xs={12} md={3} >
      {/* Image card with star and name and level */}
      <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
        <Card.Img src={characterSheet.cardImg} className="w-100 h-auto" />
        <Card.Body>
          <h3>{characterSheet.name} <Image src={Assets.elements[elementKey]} className="inline-icon" /> <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /></h3>
          <h6><Stars stars={characterSheet.star} colored /></h6>
          <h5>Level: {Character.getLevelString(character)}</h5>
          <Row className="px-2 mb-2">
            {["auto", "skill", "burst"].map(tKey =>
              <Col xs={4} className="p-1" key={tKey}>
                <Image src={characterSheet.getTalentOfKey(tKey, build.characterEle)?.img} className="w-100 h-auto" roundedCircle />
                <h5 className="mb-0"><Badge variant="info" style={{ position: "absolute", bottom: "0", right: "0" }}><strong>{tlvl[tKey] + 1}</strong></Badge></h5>
              </Col>)}
          </Row>
          <div className="text-center"><h6>{characterSheet.constellationName}</h6></div>
          <Row className="px-2">
            {[...Array(6).keys()].map(i =>
              <Col xs={4} className="p-1" key={i}>
                <Image src={characterSheet.getTalentOfKey(`constellation${i + 1}`, build.characterEle)?.img} className={`w-100 h-auto ${constellation > i ? "" : "overlay-dark"} cursor-pointer`}
                  roundedCircle onClick={() => editable && characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })} />
              </Col>)}
          </Row>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} md={9} >
      <WeaponStatsEditorCard {...{ characterSheet, weaponSheet, editable, character, characterDispatch, equippedBuild, newBuild }} />
      <MainStatsCards {...{ characterSheet, weaponSheet, editable, character, characterDispatch, equippedBuild, newBuild }} />
    </Col>
  </Row >
}

function WeaponStatsCard({ title, statsVals = {}, stats }: { title: Displayable, statsVals?: object, stats: ICalculatedStats }) {
  if ((Object.keys(statsVals ?? {}) as any).length === 0) return null
  const fields = statsToFields(statsVals, stats)
  return <Card bg="darkcontent" text={"lightfont" as any} className="mb-2">
    <Card.Header className="py-2 px-3">{title}</Card.Header>
    <ListGroup className="text-white" variant="flush">
      {fields.map((field, i) => <FieldDisplay newBuild={undefined} key={i} index={i} {...{ field, equippedBuild: stats, className: "px-3 py-2" }} />)}
    </ListGroup>
  </Card>
}


function WeaponStatsEditorCardWeaponDropdown({ weaponSheet, weaponTypeKey, setStateWeapon }: { weaponSheet: WeaponSheet, weaponTypeKey: string, setStateWeapon: (key: any, value: any) => void }) {
  const weaponSheets = usePromise(WeaponSheet.getAll(), [])
  if (!weaponSheets) return null

  return <DropdownButton title={weaponSheet.name}>
    {allRarities.map((stars, i, arr) => <React.Fragment key={stars}>
      <Dropdown.ItemText key={"star" + stars}><Stars stars={stars} /></Dropdown.ItemText>
      {Object.entries(WeaponSheet.getWeaponsOfType(weaponSheets, weaponTypeKey)).filter(([, weaponObj]: any) => weaponObj.rarity === stars).map(([key, weaponObj]: any) =>
        <Dropdown.Item key={key} onClick={() => setStateWeapon("key", key)}>
          {weaponObj.name}
        </Dropdown.Item>
      )}
      {(i !== arr.length - 1) && < Dropdown.Divider />}
    </React.Fragment>)}
  </DropdownButton>
}

type WeaponStatsEditorCardProps = {
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet
  editable: boolean
  character: ICharacter
  characterDispatch: (any) => void
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}
function WeaponStatsEditorCard({ characterSheet, weaponSheet, editable, character, character: { weapon }, characterDispatch, equippedBuild, newBuild }: WeaponStatsEditorCardProps) {
  const [editing, SetEditing] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null

  const setStateWeapon = (key, value) => {
    if (key === "key") {
      if (value === weapon.key) return
      else {
        //reset the conditionalNum when we switch weapons
        const { conditionalValues } = character
        delete conditionalValues.weapon
        characterDispatch({ conditionalValues })
      }
    }
    character.weapon[key] = value
    characterDispatch({ weapon: character.weapon })
  }
  const substatKey = Weapon.getWeaponSubstatKey(weaponSheet)
  const weaponTypeKey = characterSheet.weaponTypeKey
  const weaponDisplayMainVal = weapon.overrideMainVal || Weapon.getWeaponMainStatVal(weaponSheet, weapon.levelKey)
  const weaponDisplaySubVal = weapon.overrideSubVal || Weapon.getWeaponSubstatVal(weaponSheet, weapon.levelKey)
  const weaponPassiveName = weaponSheet.passiveName
  const weaponBonusStats = weaponSheet.stats(build)
  const conditionals = Conditional.conditionals.weapon[weapon.key] as IConditionals
  const document = weaponSheet.document
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
    <Card.Header>
      <Row>
        <Col>
          <span>Weapon</span>
        </Col>
        <Col xs="auto">
          <Button variant="info" size="sm" onClick={() => setShowDescription(!showDescription)}>
            <span><FontAwesomeIcon icon={faQuoteLeft} /> {showDescription ? "Hide Desc." : "Show Desc."}</span>
          </Button>
        </Col>
        {editable ? <Col xs="auto" >
          <Button variant={editing ? "danger" : "info"} onClick={() => SetEditing(!editing)} size="sm">
            <span><FontAwesomeIcon icon={editing ? faSave : faEdit} /> {editing ? "EXIT" : "EDIT"}</span>
          </Button>
        </Col> : null}
      </Row>
    </Card.Header>
    <Card.Body >
      <Row className="mb-n2">
        <Col xs={12} md={3} lg={4}>
          <Image src={weaponSheet.img} className={`w-100 h-auto grad-${weaponSheet.rarity}star`} thumbnail />
        </Col>
        {editing ? <Col>
          <Row>
            <Col lg="auto" xs={6} className="mb-2 pr-0">
              <WeaponStatsEditorCardWeaponDropdown weaponSheet={weaponSheet} weaponTypeKey={weaponTypeKey} setStateWeapon={setStateWeapon} />
            </Col>
            <Col lg="auto" xs={6} className="mb-2 pr-0">
              <DropdownButton title={Weapon.getLevelName(weapon.levelKey)}>
                <Dropdown.ItemText>
                  <span>Select Weapon Level</span>
                </Dropdown.ItemText>
                {Object.entries(LevelNameData).reverse().map(([key, name]) =>
                  <Dropdown.Item key={key} onClick={() => setStateWeapon("levelKey", key)}>
                    {name}
                  </Dropdown.Item>)}
              </DropdownButton>
            </Col>
            {weaponPassiveName && <Col lg="auto" xs={6} className="mb-2">
              <DropdownButton title={`Refinement ${weapon.refineIndex + 1}`} className="w-100">
                <Dropdown.ItemText>
                  <span>Select Weapon Refinement</span>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                {[...Array(5).keys()].map(key =>
                  <Dropdown.Item key={key} onClick={() => setStateWeapon("refineIndex", key)}>
                    {`Refinement ${key + 1}`}
                  </Dropdown.Item>)}
              </DropdownButton>
            </Col>}
            <Col xs={12} className="mb-2">
              <StatInput
                name={<span><FontAwesomeIcon icon={faGavel} className="mr-2" />ATK</span>}
                placeholder="Weapon Attack"
                value={weaponDisplayMainVal}
                percent={false}
                onValueChange={(value) => setStateWeapon("overrideMainVal", value)}
                defaultValue={Weapon.getWeaponMainStatVal(weaponSheet, weapon.levelKey)}
              />
            </Col>
            {substatKey && <Col xs={12} className="mb-2">
              <StatInput
                name={<span><span className="mr-2">{StatIconEle(substatKey)}</span>{Stat.getStatName(substatKey)}</span>}
                placeholder="Weapon Substat"
                value={weaponDisplaySubVal}
                percent={Stat.getStatUnit(substatKey) === "%"}
                onValueChange={(value) => setStateWeapon("overrideSubVal", value)}
                defaultValue={Weapon.getWeaponSubstatVal(weaponSheet, weapon.levelKey)}
              />
            </Col>}
          </Row>
        </Col> :
          <Col>
            <h5 className="mb-0">{weaponSheet.name} {Weapon.getLevelName(weapon.levelKey)} {weaponPassiveName && `(Refinement ${weapon.refineIndex + 1})`}</h5>
            <div className="mb-2"><Stars stars={weaponSheet.rarity} /></div>
            <h6>{weaponPassiveName}</h6>
            <div className="mb-2">{weaponPassiveName && weaponSheet.passiveDescription(build)}</div>
            <WeaponStatsCard title={"Main Stats"} statsVals={{ atk: weaponDisplayMainVal, [substatKey]: weaponDisplaySubVal }} stats={build} />
            <WeaponStatsCard title={"Bonus Stats"} statsVals={weaponBonusStats} stats={build} />
            {/* TODO: remove conditionals display here in lieu of document once sheets are converted*/}
            {Boolean(conditionals) && Object.entries(conditionals).map(([stateKey, conditional]) =>
              <ConditionalDisplay key={stateKey as any} {...{ conditional, equippedBuild, newBuild, characterDispatch, editable }} fieldClassName="py-2 px-3" />)}

            {document ? <DocumentDisplay {...{ sections: document, equippedBuild, newBuild, characterDispatch, editable }} /> : null}
          </Col>}
      </Row>
      {showDescription && <small>{weaponSheet.description}</small>}
    </Card.Body>
  </Card>
}

type MainStatsCardsProps = {
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet,
  editable: boolean,
  character: ICharacter,
  characterDispatch: (any) => void,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats
}
function MainStatsCards({ characterSheet, weaponSheet, editable, character, characterDispatch, equippedBuild, newBuild }: MainStatsCardsProps) {
  const [editing, SetEditing] = useState(false)
  const [editingOther, SetEditingOther] = useState(false)
  const [editingMisc, SetEditingMisc] = useState(false)

  const additionalKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"]
  const displayStatKeys = ["finalHP", "finalATK", "finalDEF"]
  displayStatKeys.push(...additionalKeys)
  const editStatKeys = ["hp", "hp_", "def", "def_", "atk", "atk_"]
  editStatKeys.push(...additionalKeys)
  const otherStatKeys: any[] = [];

  ["physical", ...allElements].forEach(ele => {
    otherStatKeys.push(`${ele}_dmg_`)
    otherStatKeys.push(`${ele}_res_`)
  })
  otherStatKeys.push("stamina", "incHeal_", "powShield_")

  const miscStatkeys = [
    "normal_dmg_", "normal_critRate_",
    "charged_dmg_", "charged_critRate_",
    "skill_dmg_", "skill_critRate_",
    "burst_dmg_", "burst_critRate_",
    "dmg_", "moveSPD_", "atkSPD_", "weakspotDMG_"]

  const specializedStatKey = characterSheet.getSpecializedStat(character.ascension)
  const specializedStatVal = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "specializedStatVal");
  const specializedStatUnit = Stat.getStatUnit(specializedStatKey)

  const isPercentSpecialStatSelect = Stat.getStatUnit(specializedStatKey) === "%"

  const displayNewBuildProps = { character, equippedBuild, newBuild, editable }
  return <>
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Main Base Stats</span>
          </Col>
          {editable ? <Col xs="auto" >
            <Button variant={editing ? "danger" : "info"} onClick={() => SetEditing(!editing)} size="sm">
              <span><FontAwesomeIcon icon={editing ? faSave : faEdit} /> {editing ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col> : null}
        </Row>
      </Card.Header>
      {editing ?
        <Card.Body>
          <Row className="mb-2">
            {editStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}>
                <StatInput
                  prependEle={undefined}
                  disabled={undefined}
                  className="mb-2"
                  name={<span>{StatIconEle(statKey)} {Stat.getStatNamePretty(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatName(statKey)}`}
                  value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={value => characterDispatch({ type: "statOverride", statKey, value, characterSheet, weaponSheet })}
                  defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                />
              </Col>)}

            <Col lg={6} xs={12}>
              <StatInput
                className="mb-2"
                name={Stat.getStatNameWithPercent(specializedStatKey, "Specialized Stat")}
                placeholder={"Character Special Stat"}
                value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "specializedStatVal")}
                percent={isPercentSpecialStatSelect}
                onValueChange={value => characterDispatch({ type: "statOverride", statKey: "specializedStatVal", value, characterSheet, weaponSheet })}
                defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, "specializedStatVal")}
              />
            </Col>
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {displayStatKeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay characterSheet={characterSheet} weaponSheet={weaponSheet} statKey={statKey} {...displayNewBuildProps} /></Col>)}
            <Col lg={6} xs={12}>
              <span><b>Specialized:</b> <span className={Character.hasOverride(character, "specializedStatKey") ? "text-warning" : ""}>{Stat.getStatName(specializedStatKey)}</span></span>
              <span className={`float-right ${Character.hasOverride(character, "specializedStatVal") ? "text-warning" : ""}`}>{`${specializedStatVal.toFixed(Stat.fixedUnit(specializedStatKey))}${specializedStatUnit}`}</span>
            </Col>
          </Row>
        </Card.Body>
      }
    </Card >
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Other Stats</span>
          </Col>
          {editable && <Col xs="auto" >
            <Button variant={editingOther ? "danger" : "info"} onClick={() => SetEditingOther(!editingOther)} size="sm">
              <span><FontAwesomeIcon icon={editingOther ? faSave : faEdit} /> {editingOther ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col>}
        </Row>
      </Card.Header>
      {editingOther ?
        <Card.Body>
          <Row className="mb-2">
            {otherStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}>
                <StatInput
                  className="mb-2"
                  name={<span>{StatIconEle(statKey)} {Stat.getStatName(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatNameRaw(statKey)}`}
                  value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={value => characterDispatch({ type: "statOverride", statKey, value, characterSheet, weaponSheet })}
                  defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                />
              </Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">{otherStatKeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay characterSheet={characterSheet} weaponSheet={weaponSheet} statKey={statKey} {...displayNewBuildProps} /></Col>)}</Row>
        </Card.Body>
      }
    </Card>
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Misc Stats</span>
          </Col>
          {editable && <Col xs="auto" >
            <Button variant={editingMisc ? "danger" : "info"} onClick={() => SetEditingMisc(!editingMisc)} size="sm">
              <span><FontAwesomeIcon icon={editingMisc ? faSave : faEdit} /> {editingMisc ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col>}
        </Row>
      </Card.Header>
      {editingMisc ?
        <Card.Body>
          <Row className="mb-2">
            {miscStatkeys.map(statKey =>
              <Col xl={6} xs={12} key={statKey}>
                <StatInput
                  className="mb-2"
                  name={<span>{StatIconEle(statKey)} {Stat.getStatName(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatNameRaw(statKey)}`}
                  value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={value => characterDispatch({ type: "statOverride", statKey, value, characterSheet, weaponSheet })}
                  defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                />
              </Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">{miscStatkeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay characterSheet={characterSheet} weaponSheet={weaponSheet} statKey={statKey} {...displayNewBuildProps} /></Col>)}</Row>
        </Card.Body>
      }
    </Card>
  </>
}
