import card from './Character_Klee_Card.jpg'
import thumb from './Character_Klee_Thumb.png'
import c1 from './Constellation_Chained_Reactions.png'
import c2 from './Constellation_Explosive_Frags.png'
import c3 from './Constellation_Exquisite_Compound.png'
import c4 from './Constellation_Sparkly_Explosion.png'
import c5 from './Constellation_Nova_Burst.png'
import c6 from './Constellation_Blazing_Delight.png'
import normal from './Talent_Kaboom.png'
import skill from './Talent_Jumpy_Dumpty.png'
import burst from './Talent_Sparks_\'n\'_Splash.png'
import passive1 from './Talent_Pounding_Surprise.png'
import passive2 from './Talent_Sparkling_Burst.png'
import passive3 from './Talent_All_Of_My_Treasures.png'
let char = {
  card,
  thumb,
  constellation: [c1, c2, c3, c4, c5, c6],
  talent: {
    normal,
    skill,
    burst,
    passive1,
    passive2,
    passive3,
  }
};

export default char;
