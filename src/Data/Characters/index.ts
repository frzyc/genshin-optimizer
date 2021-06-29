import albedo from './Albedo'
import amber from './Amber'
import barbara from './Barbara'
import beidou from './Beidou'
import bennett from './Bennett'
import chongyun from './Chongyun'
import diluc from './Diluc'
import diona from './Diona'
import eula from './Eula'
import fischl from './Fischl'
import ganyu from './Ganyu'
import hutao from './HuTao'
import jean from './Jean'
import kaedeharakazuha from './KaedeharaKazuha'
import kaeya from './Kaeya'
import keqing from './Keqing'
import klee from './Klee'
import lisa from './Lisa'
import mona from './Mona'
import ningguang from './Ningguang'
import noelle from './Noelle'
import qiqi from './Qiqi'
import razor from './Razor'
import rosaria from './Rosaria'
import sucrose from './Sucrose'
import tartaglia from './Tartaglia'
import traveler from './Traveler'
import venti from './Venti'
import xiao from './Xiao'
import xiangling from './Xiangling'
import xingqiu from './Xingqiu'
import xinyan from './Xinyan'
import yanfei from './Yanfei'
import zhongli from './Zhongli'
import { CharacterKey } from '../../Types/consts'
import { ICharacterSheet } from '../../Types/character'
import { documentSectionsProcessing } from '../../Util/DocumentUtil'
const characters: StrictDict<CharacterKey, ICharacterSheet> = {
  albedo,
  amber,
  barbara,
  beidou,
  bennett,
  chongyun,
  diluc,
  diona,
  eula,
  fischl,
  ganyu,
  hutao,
  jean,
  kaedeharakazuha,
  kaeya,
  keqing,
  klee,
  lisa,
  mona,
  ningguang,
  noelle,
  qiqi,
  razor,
  rosaria,
  sucrose,
  tartaglia,
  traveler,
  venti,
  xiao,
  xiangling,
  xingqiu,
  xinyan,
  yanfei,
  zhongli
};

Object.values(characters).forEach(char => {
  if ("talent" in char)
    Object.values(char.talent.sheets).forEach(talentSheetElement =>
      documentSectionsProcessing(talentSheetElement.sections))
  else //char.talents -> traveler
    Object.values(char.talents).forEach(talentSheet =>
      Object.values(talentSheet.sheets).forEach(talentSheetElement =>
        documentSectionsProcessing(talentSheetElement.sections)))
})
export default characters