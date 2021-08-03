import albedo from './albedo'
import amber from './amber'
import barbara from './barbara'
import beidou from './beidou'
import bennett from './bennett'
import chongyun from './chongyun'
import diluc from './diluc'
import diona from './diona'
import eula from './eula'
import fischl from './fischl'
import ganyu from './ganyu'
import hutao from './hutao'
import jean from './jean'
import kaedeharakazuha from './kaedeharakazuha'
import kaeya from './kaeya'
import kamisatoayaka from './kamisatoayaka'
import keqing from './keqing'
import klee from './klee'
import lisa from './lisa'
import mona from './mona'
import ningguang from './ningguang'
import noelle from './noelle'
import qiqi from './qiqi'
import razor from './razor'
import rosaria from './rosaria'
import sucrose from './sucrose'
import tartaglia from './tartaglia'
import traveler from './traveler'
import venti from './venti'
import xiao from './xiao'
import xiangling from './xiangling'
import xingqiu from './xingqiu'
import xinyan from './xinyan'
import yanfei from './yanfei'
import zhongli from './zhongli'
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
  kamisatoayaka,
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
} as const

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