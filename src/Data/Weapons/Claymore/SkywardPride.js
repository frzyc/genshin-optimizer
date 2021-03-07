import SkywardPride from './Weapon_Skyward_Pride.png'
import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"

const refinementVals = [8, 10, 12, 14, 16]
const refinementDmgVals = [80, 100, 120, 140, 160]
const weapon = {
  name: "Skyward Pride",
  weaponType: "claymore",
  img: SkywardPride,
  rarity: 5,
  passiveName: "Sky-ripping Dragon Spine",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Increases all DMG by {refinementVals[refineIndex]}%. After using an Elemental Burst, Normal or Charged Attack, on hit, creates a vacuum blade that does {refinementDmgVals[refineIndex]}% of ATK{DisplayPercent(refinementDmgVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))} as DMG to opponents along its path. Lasts for 20s or 8 vacuum blades.</span>,
  description: "A claymore that symbolizes the pride of Dvalin soaring through the skies. When swung, it emits a deep hum as the full force of Dvalin's command of the sky and the wind is unleashed.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    subStatKey: "enerRech_",
    sub: [8, 9.3, 10.9, 12.5, 14.1, 14.1, 15.8, 17.4, 19, 20.6, 20.6, 22.2, 23.8, 23.8, 25.4, 27.1, 27.1, 28.7, 30.3, 30.3, 31.9, 33.5, 33.5, 35.1, 36.8],
  },
  stats: (refineIndex) => ({
    dmg_: refinementVals[refineIndex]
  })
}
export default weapon