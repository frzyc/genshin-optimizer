import Albedo from './Albedo'
import Amber from './Amber'
import Barbara from './Barbara'
import Beidou from './Beidou'
import Bennett from './Bennett'
import Chongyun from './Chongyun'
import Diluc from './Diluc'
import Diona from './Diona'
import Eula from './Eula'
import Fischl from './Fischl'
import Ganyu from './Ganyu'
import HuTao from './HuTao'
import Jean from './Jean'
import KaedeharaKazuha from './KaedeharaKazuha'
import Kaeya from './Kaeya'
import KamisatoAyaka from './KamisatoAyaka'
import Keqing from './Keqing'
import Klee from './Klee'
import Lisa from './Lisa'
import Mona from './Mona'
import Ningguang from './Ningguang'
import Noelle from './Noelle'
import Qiqi from './Qiqi'
import Razor from './Razor'
import Rosaria from './Rosaria'
import Sayu from './Sayu'
import Sucrose from './Sucrose'
import Tartaglia from './Tartaglia'
import Traveler from './Traveler'
import Venti from './Venti'
import Xiao from './Xiao'
import Xiangling from './Xiangling'
import Xingqiu from './Xingqiu'
import Xinyan from './Xinyan'
import Yanfei from './Yanfei'
import Yoimiya from './Yoimiya'
import Zhongli from './Zhongli'
import { CharacterKey } from '../../Types/consts'
import { ICharacterSheet } from '../../Types/character'
import { documentSectionsProcessing } from '../../Util/DocumentUtil'
const characters: StrictDict<CharacterKey, ICharacterSheet> = {
  Albedo,
  Amber,
  Barbara,
  Beidou,
  Bennett,
  Chongyun,
  Diluc,
  Diona,
  Eula,
  Fischl,
  Ganyu,
  HuTao,
  Jean,
  KaedeharaKazuha,
  Kaeya,
  KamisatoAyaka,
  Keqing,
  Klee,
  Lisa,
  Mona,
  Ningguang,
  Noelle,
  Qiqi,
  Razor,
  Rosaria,
  Sayu,
  Sucrose,
  Tartaglia,
  Traveler,
  Venti,
  Xiao,
  Xiangling,
  Xingqiu,
  Xinyan,
  Yanfei,
  Yoimiya,
  Zhongli
} as const

Object.values(characters).forEach(char => {
  if ("talent" in char)
    Object.values(char.talent.sheets).forEach(talentSheetElement =>
      documentSectionsProcessing(talentSheetElement.sections))
  else //char.talents -> Traveler
    Object.values(char.talents).forEach(talentSheet =>
      Object.values(talentSheet.sheets).forEach(talentSheetElement =>
        documentSectionsProcessing(talentSheetElement.sections)))
})
export default characters