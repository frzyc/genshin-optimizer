import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Alert, Badge, Button, Card, Col, Dropdown, DropdownButton, FormControl, InputGroup, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import Stat from '../Stat';
import { deepClone, getArrLastElement, getRandomElementFromArray, getRandomIntInclusive } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import ArtifactDatabase from './ArtifactDatabase';
import PercentBadge from './PercentBadge';
import UploadDisplay from './UploadDisplay';

export default class ArtifactEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = ArtifactEditor.getInitialState()
  }
  static initialState = {
    id: null,
    artifactIdToEdit: null,
    setKey: "",
    numStars: 0,
    level: 0,
    slotKey: "",//one of flower, plume, sands, globlet, circlet
    mainStatKey: "",
    substats: [...Array(4).keys()].map(() => ({ key: "", value: 0 })),
  }
  static getInitialState = () => deepClone(ArtifactEditor.initialState)
  setLevel = (newlevel) => this.setState(state => {
    newlevel = parseInt(newlevel)
    if (isNaN(newlevel)) newlevel = 0
    if (newlevel < 0) newlevel = 0;
    if (newlevel > state.numStars * 4) newlevel = state.numStars * 4;
    return { level: newlevel }
  })

  getRemainingSubstats = (mainStatKey, substats) =>
    Artifact.getSubStatKeys().filter(key => {
      //if mainstat has key, not valid
      if (mainStatKey === key) return false;
      //if any one of the substat has, not valid.
      return !substats.some(substat => substat?.key === key)
    });
  saveArtifact = (id) => {
    this.uploadDisplayReset?.()
    const artToSave = deepClone(this.state)
    delete artToSave.artifactIdToEdit;
    if (typeof id === "string") {
      const art = ArtifactDatabase.get(id)
      if (art) {
        artToSave.id = art.id
        artToSave.location = art.location
      }
    }

    if (!artToSave.maximumEfficiency) //calculate rolls & efficiency for caching
      Artifact.substatsValidation(artToSave)

    this.props.addArtifact?.(artToSave)
    this.setState(ArtifactEditor.getInitialState());
  }
  clearArtifact = () => {
    this.uploadDisplayReset?.()
    this.props.cancelEdit?.();
    this.setState(ArtifactEditor.getInitialState());
  }
  setSetKey = (setKey) => this.setState(state => {
    let numStars = getArrLastElement(Artifact.getRarityArr(setKey))
    let level = (!state.level || state.level > numStars * 4) ? numStars * 4 : state.level
    return { setKey, numStars, level }
  })
  setSubStat = (index, key = "", value = 0) => this.setState(state => {
    if (index >= 4) return
    let substats = state.substats
    substats[index].key = key
    substats[index].value = value
    return { substats }
  })

  setMainStatKey = (mainStatKey) => this.setState(state => {
    state.substats.forEach((substat, index) =>
      substat.key && substat.key === mainStatKey && (state.substats[index] = { key: "", value: 0 }))
    return { mainStatKey }
  })

  setSlotKey = (slotKey) => this.setState(state => {
    //find a mainstat that isnt taken,
    let mainstats = Artifact.getSlotMainStatKeys(slotKey);
    for (const mainStatKey of mainstats)
      if (!state.substats.some(substat => (substat && substat.key ? (substat.key === mainStatKey) : false)))
        return { slotKey, mainStatKey }
    //if not, then remove one of the substat.
    let mainStatKey = mainstats[0]
    this.setMainStatKey(mainStatKey)
    return { slotKey }
  })
  checkDuplicate = () => {
    let { id, setKey = "", numStars = 0, level = 0, slotKey = "", mainStatKey = "", substats = deepClone(ArtifactEditor.initialState.substats) } = this.state
    let dupId = null
    let dup = false
    if (!id && setKey && slotKey && numStars && mainStatKey) {
      //check for a "upgrade"
      let artifacts = Object.values(ArtifactDatabase.getArtifactDatabase()).filter(art => {
        if (setKey !== art.setKey) return false;
        if (numStars !== art.numStars) return false;
        if (slotKey !== art.slotKey) return false
        if (mainStatKey !== art.mainStatKey) return false
        if (art.level > level) return false;
        for (const artSubstat of art.substats) {
          if (!artSubstat.key) continue
          let substat = substats.find(substat =>
            substat.key === artSubstat.key &&
            (substat.value > artSubstat.value || Artifact.subStatCloseEnough(substat.key, substat.value, artSubstat.value)))
          if (!substat) return false
        }
        return true
      })
      dupId = artifacts[0]?.id
      //check for a dup
      if (artifacts.length > 0) {
        let dupArtifacts = artifacts.filter(art => {
          if (art.level !== level) return false;
          for (const artSubstat of art.substats) {
            if (!artSubstat.key) continue
            let substat = substats.find(substat =>
              substat.key === artSubstat.key && Artifact.subStatCloseEnough(substat.key, substat.value, artSubstat.value))
            if (!substat) return false
          }
          return true
        })
        if (dupArtifacts.length > 0) {
          dupId = dupArtifacts[0].id
          dup = true
        }
      }
    }
    return { dupId, dup }
  }
  randomizeArtifact = () => {
    let state = ArtifactEditor.getInitialState();
    //randomly choose artifact set
    state.setKey = getRandomElementFromArray(Artifact.getSetKeys());
    //choose star
    state.numStars = getRandomElementFromArray(Artifact.getRarityArr(state.setKey));
    //choose piece
    state.slotKey = getRandomElementFromArray(Object.keys(Artifact.getPieces(state.setKey)));
    //choose mainstat
    state.mainStatKey = getRandomElementFromArray(Artifact.getSlotMainStatKeys(state.slotKey));

    //choose initial substats from star
    let numOfInitialSubStats = getRandomIntInclusive(Artifact.getBaseSubRollNumLow(state.numStars), Artifact.getBaseSubRollNumHigh(state.numStars));

    //choose level
    state.level = getRandomIntInclusive(0, state.numStars * 4)
    let numUpgradesOrUnlocks = Math.floor(state.level / 4);
    let totRolls = numOfInitialSubStats + numUpgradesOrUnlocks
    if (totRolls >= 4) {
      numOfInitialSubStats = 4;
      numUpgradesOrUnlocks = totRolls - 4;
    } else {
      numOfInitialSubStats = totRolls;
      numUpgradesOrUnlocks = 0;
    }
    let RollStat = (subStatKey) =>
      getRandomElementFromArray(Artifact.getSubstatRollData(subStatKey, state.numStars))

    let remainingSubstats = this.getRemainingSubstats(state.mainStatKey, state.substats)
    //set initial substat & value
    for (let i = 0; i < numOfInitialSubStats; i++) {
      let substat = state.substats[i]
      substat.key = getRandomElementFromArray(remainingSubstats)
      remainingSubstats = remainingSubstats.filter(key => key !== substat.key)
      substat.value = RollStat(substat.key)
    }

    //numUpgradesOrUnlocks should only have upgrades right now. that means all 4 substats have value.
    for (let i = 0; i < numUpgradesOrUnlocks; i++) {
      let substat = getRandomElementFromArray(state.substats)
      substat.value += RollStat(substat.key)
      //make sure there is no rounding numbers
      if (!Number.isInteger(substat.value)) substat.value = parseFloat(substat.value.toFixed(1))

    }
    this.props.cancelEdit?.();
    this.setState(state)
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.artifactIdToEdit && prevProps.artifactIdToEdit !== this.props.artifactIdToEdit)
      this.setState(deepClone(ArtifactDatabase.get(this.props.artifactIdToEdit)))
  }
  render() {
    let errMsgs = Artifact.substatsValidation(this.state)
    let { id, setKey = "", numStars = 0, level = 0, slotKey = "", mainStatKey = "", substats = deepClone(ArtifactEditor.initialState.substats), currentEfficiency, maximumEfficiency } = this.state
    //calculate duplicate
    let { dupId, dup } = this.checkDuplicate()
    return <Card bg="darkcontent" text="lightfont">
      <Card.Header>Artifact Editor</Card.Header>
      <Card.Body><Row className="mb-n2">
        {/* set & rarity */}
        <Col xs={12} lg={6} className="mb-2">
          <InputGroup className="w-100 d-flex">
            {/* Artifact Set */}
            <Dropdown as={InputGroup.Prepend} className="flex-grow-1">
              <Dropdown.Toggle className="w-100">
                {Artifact.getSetName(setKey, "Artifact Set")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {[5, 4, 3].map((star, i) =>
                  <React.Fragment key={star}>
                    {i > 0 && <Dropdown.Divider />}
                    <Dropdown.ItemText>Max Rarity <Stars stars={star} /></Dropdown.ItemText>
                    {Artifact.getSetsByMaxStarEntries(star).map(([key, setobj]) =>
                      <Dropdown.Item key={key} onClick={() => this.setSetKey(key)}>
                        {setobj.name}
                      </Dropdown.Item >)}
                  </React.Fragment>)}
              </Dropdown.Menu>
            </Dropdown>
            {/* rarity dropdown */}
            <DropdownButton as={InputGroup.Append} title={numStars > 0 ? <Stars stars={numStars} /> : "Rarity"} disabled={!setKey}>
              {Artifact.getStars().map((star, index) => <Dropdown.Item key={index} disabled={!Artifact.getRarityArr(setKey).includes(star)} onClick={() => this.setState({ numStars: star, level: 0 })}>
                {<Stars stars={star} />}
              </Dropdown.Item>)}
            </DropdownButton>
          </InputGroup>
        </Col>
        {/* level */}
        <Col xs={12} lg={6} className="mb-2">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Level</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              value={level}
              disabled={!setKey}
              placeholder={`0~${numStars * 4}`}
              onChange={(e => this.setLevel(e.target.value))}
            />
            <InputGroup.Append>
              <Button onClick={() => this.setLevel(0)} disabled={!setKey || level === 0}>0</Button>
              <Button onClick={() => this.setLevel(level - 1)} disabled={!setKey || level === 0}>-</Button>
              <Button onClick={() => this.setLevel(level + 1)} disabled={!setKey || level === (numStars * 4)}>+</Button>
              <Button onClick={() => this.setLevel(numStars * 4)} disabled={!setKey || level === (numStars * 4)}>{numStars * 4}</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
        {/* slot */}
        <Col xs={12} lg={6} className="mb-2">
          <InputGroup>
            <DropdownButton
              title={Artifact.getSlotNameWithIcon(slotKey, "Slot")}
              disabled={!setKey}
              as={InputGroup.Prepend}
            >
              {Object.keys(Artifact.getPieces(setKey)).map(slotKey =>
                <Dropdown.Item key={slotKey} onClick={() => this.setSlotKey(slotKey)} >
                  {Artifact.getSlotNameWithIcon(slotKey, "Slot")}
                </Dropdown.Item>)}
            </DropdownButton>
            <FormControl
              value={Artifact.getPieceName(setKey, slotKey, "Unknown Piece Name")}
              disabled
              readOnly
            />
          </InputGroup>
        </Col>
        {/* main stat */}
        <Col xs={12} lg={6} className="mb-2">
          <InputGroup>
            <DropdownButton
              title={Stat.getStatNameWithPercent(mainStatKey, "Main Stat")}
              disabled={!setKey || !slotKey}
              as={InputGroup.Prepend}
            >
              <Dropdown.ItemText>Select a Main Artifact Stat </Dropdown.ItemText>
              {Artifact.getSlotMainStatKeys(slotKey).map((mainStatKey) =>
                <Dropdown.Item key={mainStatKey} onClick={() => this.setMainStatKey(mainStatKey)} >
                  {Stat.getStatNameWithPercent(mainStatKey)}
                </Dropdown.Item>)}
            </DropdownButton>
            <FormControl
              value={mainStatKey ? `${Artifact.getMainStatValue(mainStatKey, numStars, level)}${Stat.getStatUnit(mainStatKey)}` : "Main Stat"}
              disabled
              readOnly
            />
          </InputGroup>
        </Col>
        {/* substat selections */}
        {substats.map((substat, index) => {
          const remainingSubstats = this.getRemainingSubstats(mainStatKey, substats);
          return <Col key={"substat" + index} className="mb-2" xs={12} lg={6}>
            <SubStatInput {...{ index, substat, numStars, remainingSubstats, setSubStat: this.setSubStat }} />
          </Col>
        })}
        {/* Current Substat Efficiency */}
        <Col xs={12} lg={6} className="mb-2">
          <Card bg="lightcontent" text="lightfont">
            <Card.Body className="py-1 px-2">
              <Row>
                <Col className="text-center"><span >Current Substat Efficiency </span></Col>
                <Col xs="auto">
                  <PercentBadge valid={!errMsgs.length} percent={currentEfficiency}>
                    {currentEfficiency.toFixed(2) + "%"}
                  </PercentBadge>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Popover >
                      <Popover.Title as="h5">Current Substat Efficiency</Popover.Title>
                      <Popover.Content>
                        <span>Every 4 artifact upgrades, you get a substat roll. <strong>Substat Efficiency</strong> calculates how high the substat rolled as a percentage.</span>
                      </Popover.Content>
                    </Popover>}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                  </OverlayTrigger>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        {/* Maximum Substat Efficiency */}
        <Col xs={12} lg={6} className="mb-2">
          <Card bg="lightcontent" text="lightfont">
            <Card.Body className="py-1 px-2">
              <Row>
                <Col className="text-center"><span>Maximum Substat Efficiency </span></Col>
                <Col xs="auto">
                  <PercentBadge valid={!errMsgs.length} percent={maximumEfficiency}>
                    {maximumEfficiency.toFixed(2) + "%"}
                  </PercentBadge>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Popover >
                      <Popover.Title as="h5">Maximum Substat Efficiency</Popover.Title>
                      <Popover.Content>
                        <span>The <strong>Maximum Substat Efficiency</strong> of an artifact calculates the efficiency if the remaining upgrades rolled their maximum values.</span>
                      </Popover.Content>
                    </Popover>}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                  </OverlayTrigger>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        {/* Image OCR */}
        <Col xs={12} className="mb-2">
          <UploadDisplay setState={state => this.setState(state)} reset={reset => this.uploadDisplayReset = reset} />
        </Col>
        {/* Duplicate/Updated/Edit UI */}
        {(dupId || id) && <Col xs={12} className="mb-2">
          <Row className="d-flex justify-content-around mb-n2">
            <Col lg={4} md={6} className="mb-2">
              <h6 className="text-center">Artifact Editor Preview</h6>
              <div><ArtifactCard artifactObj={this.state} /></div>
            </Col>
            <Col lg={4} md={6} className="mb-2">
              <h6 className="text-center">{dupId ? `Detected ${dup ? "Duplicate" : "Upgraded"} Artifact` : `Before Edit`}</h6>
              <div><ArtifactCard artifactId={dupId || id} /></div>
            </Col>
          </Row>
        </Col>}
        {/* Error alert */}
        {Boolean(errMsgs.length) && <Col xs={12} className="mb-2">
          <Alert variant="danger" className="py-2 px-3 mb-0 ">{errMsgs.map(e => <div key={e}>{e}</div>)}</Alert>
        </Col>}
      </Row></Card.Body>
      <Card.Footer>
        <Button className="mr-2" onClick={this.saveArtifact} disabled={ArtifactDatabase.isInvalid(this.state) || errMsgs.length} variant={dupId ? "warning" : "primary"}>
          {id ? "Save Artifact" : "Add Artifact"}
        </Button>
        <Button className="mr-2" onClick={this.clearArtifact} variant="success">Clear</Button>
        <Button variant="info" onClick={this.randomizeArtifact}>Randomize</Button>
        {Boolean(dupId) && <Button className="float-right" onClick={() => this.saveArtifact(dupId)} disabled={ArtifactDatabase.isInvalid(this.state) || errMsgs.length} variant="success">Update Artifact</Button>}
      </Card.Footer>
    </Card>
  }
}
function SubStatInput({ index, substat: { key, value, rolls, efficiency }, numStars, remainingSubstats = [], setSubStat }) {
  const isPercentStat = Stat.getStatUnit(key) === "%"
  let error = ""
  if (!numStars && key && value) error = `Artifact Rarity not set.`;
  let rollData = Artifact.getSubstatRollData(key, numStars)
  let rollNum = rolls?.length || 0
  if (!error && !rollNum && key && value)
    error = `Substat cannot be rolled 0 times.`
  if (!error && numStars) {
    //account for the rolls it will to fill all 4 substates, +1 for its base roll
    let totalAllowableRolls = Artifact.getNumUpgradesOrUnlocks(numStars) - (4 - Artifact.getBaseSubRollNumHigh(numStars)) + 1;
    if (rollNum > totalAllowableRolls) error = `Substat cannot be rolled more than ${totalAllowableRolls} times.`;
  }
  let rollLabel = null
  if (!error) {
    let rollBadge = <Badge variant={rollNum === 0 ? "secondary" : `${rollNum}roll`} className="text-darkcontent">
      {rollNum ? rollNum : "No"} Roll{(rollNum > 1 || rollNum === 0) && "s"}
    </Badge>
    let rollArr = rolls?.map((val, i) => {
      let ind = rollData.indexOf(val)
      let displayNum = 6 - (rollData.length - 1 - ind)
      return <span key={i} className={`mr-2 text-${displayNum}roll`}>{val}</span>
    })
    let rollDataDisplay = Boolean(rollData.length) && <span className="float-right text-right"><small>Possible Rolls:</small> {rollData.map((v, i, arr) =>
      <span key={i} className={`text-${6 - (arr.length - 1 - i)}roll mr-1`}>{v}</span>)}</span>
    rollLabel = <span>{rollBadge} {rollArr}{rollDataDisplay}</span>
  }
  return <Card bg="lightcontent" text="lightfont">
    <InputGroup>
      <DropdownButton
        title={Stat.getStatName(key, `Substat ${index + 1}`)}
        disabled={remainingSubstats.length === 0}
        as={InputGroup.Prepend}
      >
        {Boolean(key) && <Dropdown.Item key={key} onClick={() => setSubStat?.(index, "")} >No Substat</Dropdown.Item>}
        {remainingSubstats.map((key) =>
          <Dropdown.Item key={key} onClick={() => setSubStat?.(index, key)} >
            {Stat.getStatNameWithPercent(key)}
          </Dropdown.Item>
        )}
      </DropdownButton>
      <CustomFormControl
        float={isPercentStat}
        placeholder="Select a Substat."
        value={value || ""}
        onValueChange={(val) => setSubStat?.(index, key, val)}
        disabled={!key}
      />
      <InputGroup.Append>
        {isPercentStat && <InputGroup.Text>%</InputGroup.Text>}
        <InputGroup.Text>
          <PercentBadge
            valid={!error || !key}
            percent={efficiency}>
            {key ? (!error ? `${(efficiency ? efficiency : 0).toFixed(2)}%` : "ERR") : "No Stat"}
          </PercentBadge>
        </InputGroup.Text>
      </InputGroup.Append>
    </InputGroup>
    <label className="w-100 mb-0 p-1">{!error ? rollLabel : <span><Badge variant="danger">ERR</Badge> {error}</span>}</label>
  </Card>
}