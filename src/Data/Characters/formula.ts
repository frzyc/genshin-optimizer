import albedo from './albedo/data'
import amber from './amber/data'
import barbara from './barbara/data'
import beidou from './beidou/data'
import bennett from './bennett/data'
import chongyun from './chongyun/data'
import diluc from './diluc/data'
import diona from './diona/data'
import eula from './eula/data'
import fischl from './fischl/data'
import ganyu from './ganyu/data'
import hutao from './hutao/data'
import jean from './jean/data'
import kaedeharakazuha from './kaedeharakazuha/data'
import kaeya from './kaeya/data'
import kamisatoayaka from './kamisatoayaka/data'
import keqing from './keqing/data'
import klee from './klee/data'
import lisa from './lisa/data'
import mona from './mona/data'
import ningguang from './ningguang/data'
import noelle from './noelle/data'
import qiqi from './qiqi/data'
import razor from './razor/data'
import rosaria from './rosaria/data'
import sayu from './sayu/data'
import sucrose from './sucrose/data'
import tartaglia from './tartaglia/data'
import traveler from './traveler/data'
import venti from './venti/data'
import xiao from './xiao/data'
import xiangling from './xiangling/data'
import xingqiu from './xingqiu/data'
import xinyan from './xinyan/data'
import yanfei from './yanfei/data'
import zhongli from './zhongli/data'
import { IFormulaSheet } from '../../Types/character'
import { CharacterKey, ElementKey } from '../../Types/consts'
type IFormulaSheets = StrictDict<CharacterKey, IFormulaSheet | Dict<ElementKey, IFormulaSheet>>
const formula: IFormulaSheets = {
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
  sayu,
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
export default formula
