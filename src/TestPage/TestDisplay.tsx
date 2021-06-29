import { Container } from "react-bootstrap";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
export default function TestDisplay() {
  return <Container>
    <CharacterDisplayCard editable characterKey="kaedeharakazuha" tabName="talent" />
  </Container>
}
