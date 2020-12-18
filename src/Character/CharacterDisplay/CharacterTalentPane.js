import { Image, Row } from "react-bootstrap"
import Assets from "../../Assets/Assets"
//TODO
function CharacterTalentPane(props) {
  let { character: { characterKey } } = props
  let talent = Assets.characters?.[characterKey]?.talent
  return <Row>
    {talent && Object.entries(talent).map(([key, img]) => 
      <Image src={img} key={key} />
    )}

  </Row>
}
export default CharacterTalentPane