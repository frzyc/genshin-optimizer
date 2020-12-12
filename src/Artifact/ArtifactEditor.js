import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Alert, Button, Card, Col, Dropdown, DropdownButton, FormControl, InputGroup, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { FloatFormControl, IntFormControl } from '../Components/CustomFormControl';
import SlotIcon from '../Components/SlotIcon';
import { getRandomArbitrary, getRandomElementFromArray, getRandomIntInclusive } from '../Util';
import Artifact from './Artifact';
import { ArtifactSetsData, ArtifactSlotSData, ArtifactStarsData, ArtifactStatsData } from './ArtifactData';
import PercentBadge from './PercentBadge';

export default class ArtifactEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = ArtifactEditor.getInitialState()
  }
  static initialState = {
    setKey: "",
    numStars: 0,
    level: 0,
    slotKey: "",//one of flower, plume, sands, globlet, circlet
    mainStatKey: "",
    substats: [{}, {}, {}, {}],//{key:"",value:_}
  }
  static getInitialState = () => JSON.parse(JSON.stringify(ArtifactEditor.initialState))
  setLevel(newlevel) {
    newlevel = parseInt(newlevel)
    if (isNaN(newlevel)) newlevel = 0
    if (newlevel < 0) newlevel = 0;
    if (newlevel > this.state.numStars * 4) newlevel = this.state.numStars * 4;
    this.setState({ level: newlevel })
  }

  ArtifactDropDown = (props) => {
    let dropdownitemsForStar = (star) =>
      Artifact.getArtifactSetsByMaxStarEntries(star).map(([key, setobj]) =>
        (<Dropdown.Item key={key}
          onClick={() => this.setState(state => {
            let ret = { setKey: key, numStars: setobj.rarity[setobj.rarity.length - 1] }
            if (state.level > ret.numStars * 4) ret.level = ret.numStars * 4
            return ret
          })}
        >
          {setobj.name}
        </Dropdown.Item >))

    return (<DropdownButton as={InputGroup.Prepend} title={Artifact.getArtifactSetName(this.state.setKey, "Artifact Set")}>
      <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊🟊</Dropdown.ItemText>
      {dropdownitemsForStar(5)}
      <Dropdown.Divider />
      <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊</Dropdown.ItemText>
      {dropdownitemsForStar(4)}
      <Dropdown.Divider />
      <Dropdown.ItemText>Max Rarity 🟊🟊🟊</Dropdown.ItemText>
      {dropdownitemsForStar(3)}
    </DropdownButton>)
  }
  Test = () => <div>WTFFFFFF</div>
  MainSelection = (props) => {

    return (<InputGroup>
      {/* Don't know why I can't do <this.ArtifactDropDown />, it has error in production: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. */}
      {this.ArtifactDropDown()}
      <DropdownButton as={InputGroup.Prepend} title={this.state.numStars > 0 ? "🟊".repeat(this.state.numStars) : "Rarity"} disabled={!this.state.setKey}>
        {Object.keys(ArtifactStarsData).map((star, index) => {
          star = parseInt(star);
          return <Dropdown.Item key={index} disabled={!this.state.setKey || !ArtifactSetsData[this.state.setKey].rarity.includes(star)} onClick={() => {
            this.setState({ numStars: star, level: 0 });
          }}>
            {"🟊".repeat(star)}
          </Dropdown.Item>
        })}
      </DropdownButton>
      <InputGroup.Prepend>
        <InputGroup.Text>Level</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl
        value={this.state.level}
        disabled={!this.state.setKey}
        placeholder={`0~${this.state.numStars * 4}`}
        onChange={(e => this.setLevel(e.target.value))}
      />
      <InputGroup.Append>
        <Button onClick={() => this.setLevel(0)} disabled={!this.state.setKey || this.state.level === 0}>0</Button>
        <Button onClick={() => this.setLevel(this.state.level - 1)} disabled={!this.state.setKey || this.state.level === 0}>-</Button>
        <Button onClick={() => this.setLevel(this.state.level + 1)} disabled={!this.state.setKey || this.state.level === (this.state.numStars * 4)}>+</Button>
        <Button onClick={() => this.setLevel(this.state.numStars * 4)} disabled={!this.state.setKey || this.state.level === (this.state.numStars * 4)}>{this.state.numStars * 4}</Button>
      </InputGroup.Append>
    </InputGroup>)
  }
  MainStatInputRow = () =>
    <InputGroup>
      <DropdownButton
        title={this.state.slotKey ? (<span><FontAwesomeIcon icon={SlotIcon[this.state.slotKey]} className="fa-fw mr-1" />{ArtifactSlotSData[this.state.slotKey].name}</span>) : "Slot"}
        disabled={!this.state.setKey}
        as={InputGroup.Prepend}
      >
        {this.state.setKey && Object.keys(ArtifactSetsData[this.state.setKey].pieces).map(key =>
          <Dropdown.Item key={key} onClick={() =>
            this.setState({ slotKey: key, mainStatKey: ArtifactSlotSData[key].stats[0], substats: ArtifactEditor.getInitialState().substats })
          } >
            <FontAwesomeIcon icon={SlotIcon[key]} className="fa-fw mr-1" />
            {ArtifactSlotSData[key].name}
          </Dropdown.Item>)}
      </DropdownButton>
      <FormControl
        value={Artifact.getArtifactPieceName(this.state)}
        disabled
        readOnly
      />
      <DropdownButton
        title={Artifact.getStatName(this.state.mainStatKey, "Main Stat")}
        disabled={!this.state.setKey || !this.state.slotKey}
        as={InputGroup.Prepend}
      >
        <Dropdown.ItemText>Select a Main Artifact Stat </Dropdown.ItemText>
        {this.state.slotKey ? ArtifactSlotSData[this.state.slotKey].stats.map((stat) =>
          <Dropdown.Item key={stat} onClick={() => {
            this.setState({ mainStatKey: stat, substats: ArtifactEditor.getInitialState().substats })
          }} >
            {Artifact.getStatName(stat)}
          </Dropdown.Item>) : <Dropdown.Item />}
      </DropdownButton>
      <FormControl
        value={this.state.mainStatKey ? `${Artifact.getMainStatValue(this.state.mainStatKey, this.state.numStars, this.state.level)}${Artifact.getStatUnit(this.state.mainStatKey)}` : "Main Stat"}
        disabled
        readOnly
      />
    </InputGroup>
  SubStatInput = (props) => {
    let percentStat = props.subStatKey && Artifact.getStatUnit(props.subStatKey) === "%";
    let substatprops = {
      placeholder: "Select a Substat.",
      value: props.substatevalue ? props.substatevalue : "",
      onValueChange: (val) => this.onSubstatValueChange(val, props.index),
      disabled: !props.subStatKey
    }
    let subStatFormControl = percentStat ?
      <FloatFormControl {...substatprops} />
      : <IntFormControl {...substatprops} />
    return <InputGroup>
      <DropdownButton
        title={props.subStatKey ? ArtifactStatsData[props.subStatKey].name : `Substat ${props.index + 1}`}
        disabled={!props.remainingSubstats || props.remainingSubstats.length === 0}
        as={InputGroup.Prepend}
      >
        {props.remainingSubstats ? props.remainingSubstats.map((key) =>
          <Dropdown.Item key={key} onClick={() => this.onSubStatSelected(key, props.index)} >
            {Artifact.getStatName(key)}
          </Dropdown.Item>
        ) : <Dropdown.Item />}
      </DropdownButton>
      {subStatFormControl}
      <InputGroup.Append>
        {percentStat && <InputGroup.Text>%</InputGroup.Text>}
        <InputGroup.Text>
          <PercentBadge
            tooltip={props.subStatValidation.msg}
            valid={props.subStatValidation.valid || !props.subStatKey}
            percent={props.subStatValidation.efficiency}>
            {props.subStatKey ? (props.subStatValidation.valid ? `${(props.subStatValidation.efficiency ? props.subStatValidation.efficiency : 0).toFixed(2)}%` : "ERR") : "No Stat"}
          </PercentBadge>
        </InputGroup.Text>
      </InputGroup.Append>
    </InputGroup>
  }

  onSubStatSelected = (key, index) => {
    this.setState((state) => {
      let substats = JSON.parse(JSON.stringify(state.substats));
      substats[index] = { key: key, value: null }
      return { substats }
    });
  }
  onSubstatValueChange = (newStatValue, index) => {
    this.setState((state) => {
      let substats = JSON.parse(JSON.stringify(state.substats));
      substats[index].value = newStatValue
      return { substats }
    });
  }
  randomizeArtifact = () => {
    let state = ArtifactEditor.getInitialState();
    //randomly choose artifact set
    state.setKey = getRandomElementFromArray(Object.keys(ArtifactSetsData));
    //choose star
    state.numStars = getRandomElementFromArray(ArtifactSetsData[state.setKey].rarity);
    //choose piece
    state.slotKey = getRandomElementFromArray(Object.keys(ArtifactSetsData[state.setKey].pieces));
    //choose mainstat
    state.mainStatKey = getRandomElementFromArray(ArtifactSlotSData[state.slotKey].stats);

    //choose initial substats from star
    let numOfInitialSubStats = getRandomIntInclusive(ArtifactStarsData[state.numStars].subsBaselow, ArtifactStarsData[state.numStars].subBaseHigh);

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
    let RollStat = (subStatKey) => {
      let lowRoll = Artifact.getStatLowRollVal(subStatKey, state.numStars);
      let highRoll = Artifact.getStatHighRollVal(subStatKey, state.numStars);
      let unit = Artifact.getStatUnit(subStatKey)

      if (unit === "%")
        return parseFloat(getRandomArbitrary(lowRoll, highRoll).toFixed(1));
      else
        return getRandomIntInclusive(lowRoll, highRoll);
    }
    //set initial substat & value
    for (let i = 0; i < numOfInitialSubStats; i++) {
      let substat = state.substats[i]
      substat.key = getRandomElementFromArray(Artifact.getRemainingSubstats(state))
      substat.value = RollStat(substat.key)
    }

    //numUpgradesOrUnlocks should only have upgrades right now. that means all 4 substats have value.
    for (let i = 0; i < numUpgradesOrUnlocks; i++) {
      let substat = getRandomElementFromArray(state.substats)
      substat.value += RollStat(substat.key)
    }
    this.setState(state)
  }
  componentDidUpdate = () => {
    if (this.props.artifactToEdit && this.state.id !== this.props.artifactToEdit.id)
      this.setState(this.props.artifactToEdit)
  }
  render() {
    let remainingSubstats = Artifact.getRemainingSubstats(this.state);
    let substatValidations = this.state.substats.map(substat => Artifact.validateSubStat(this.state, substat));
    let artifactValidation = Artifact.artifactValidation(this.state, substatValidations)
    return (
      <Card bg="darkcontent" text="lightfont">
        <Card.Header>
          Artifact Editor
        </Card.Header>
        <Card.Body>
          <Row className="mb-2">
            <Col xs={12} className="mb-2"><this.MainSelection /></Col>
            <Col xs={12}><this.MainStatInputRow /></Col>
          </Row>
          <Row>
            <Col>
              <h5 className="mr-auto">Substats</h5>
              <span>
                <span className="mr-3">
                  <span>Current Substat Efficiency </span>
                  <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.currentEfficiency}>
                    {(artifactValidation.currentEfficiency ? artifactValidation.currentEfficiency : 0).toFixed(2) + "%"}
                  </PercentBadge>
                </span>

                <span >
                  <span >Maximum Substat Efficiency </span>
                  <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.maximumEfficiency}>
                    {(artifactValidation.maximumEfficiency ? artifactValidation.maximumEfficiency : 0).toFixed(2) + "%"}
                  </PercentBadge>
                </span>
                <OverlayTrigger
                  placement="left"
                  overlay={
                    <Popover >
                      <Popover.Title as="h5">Substat Efficiency</Popover.Title>
                      <Popover.Content>
                        <span>Every time 4 artifact upgrades, you get a substat roll. The <strong>substat efficiency</strong> calculates as a percentage how high the substat rolled. The <strong>Maximum Substat Efficiency</strong> of an artifact calculates the efficiency if the remaining upgrades rolled maximum.</span>
                      </Popover.Content>
                    </Popover>
                  }
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                </OverlayTrigger>
              </span>
            </Col>
          </Row>
          <Row>
            {this.state.substats.map((substat, index) =>
              <Col key={"substat" + index} className="mt-1 mb-1" xs={12} lg={6}>
                <this.SubStatInput
                  numStars={this.state.numStars}
                  remainingSubstats={remainingSubstats}
                  subStatKey={substat ? substat.key : null}
                  substatevalue={substat ? substat.value : null}
                  index={index}
                  subStatValidation={substatValidations[index]}
                />
              </Col>
            )}
          </Row>
          {artifactValidation.msg ? <Alert variant="danger">{artifactValidation.msg}</Alert> : null}
        </Card.Body>
        <Card.Footer>
          <Button className="mr-3" onClick={() => {
            let saveArtifact = { ...this.state }
            if (saveArtifact.artifactToEdit)
              delete saveArtifact.artifactToEdit;
            this.props.addArtifact && this.props.addArtifact(saveArtifact)
            this.setState(ArtifactEditor.getInitialState());
          }}>
            {this.props.artifactToEdit ? "Save Artifact" : "Add Artifact"}
          </Button>
          <Button className="mr-3" variant="success"
            onClick={() => {
              this.props.cancelEdit && this.props.cancelEdit();
              this.setState(ArtifactEditor.getInitialState());
            }}
          >
            Clear
          </Button>
          <Button variant="warning"
            onClick={this.randomizeArtifact}
          >
            Randomize
          </Button>
        </Card.Footer>
      </Card>)
  }
}
