// WARNING: Generated file, do not modify
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { allStats } from '@genshin-optimizer/zzz/stats'
import { type TagMapNodeEntries, register } from '../util'
import Anby from './sheets/Anby'
import Anton from './sheets/Anton'
import Astra from './sheets/Astra'
import Ben from './sheets/Ben'
import Billy from './sheets/Billy'
import Burnice from './sheets/Burnice'
import Caesar from './sheets/Caesar'
import Corin from './sheets/Corin'
import Ellen from './sheets/Ellen'
import Evelyn from './sheets/Evelyn'
import Grace from './sheets/Grace'
import Harumasa from './sheets/Harumasa'
import Hugo from './sheets/Hugo'
import Jane from './sheets/Jane'
import Koleda from './sheets/Koleda'
import Lighter from './sheets/Lighter'
import Lucy from './sheets/Lucy'
import Lycaon from './sheets/Lycaon'
import Miyabi from './sheets/Miyabi'
import Nekomata from './sheets/Nekomata'
import Nicole from './sheets/Nicole'
import Piper from './sheets/Piper'
import Pulchra from './sheets/Pulchra'
import QingYi from './sheets/QingYi'
import Rina from './sheets/Rina'
import Seth from './sheets/Seth'
import Soldier0Anby from './sheets/Soldier0Anby'
import Soldier11 from './sheets/Soldier11'
import Soukaku from './sheets/Soukaku'
import Trigger from './sheets/Trigger'
import Vivian from './sheets/Vivian'
import Yanagi from './sheets/Yanagi'
import ZhuYuan from './sheets/ZhuYuan'
import { entriesForChar } from './util'

const data: TagMapNodeEntries[] = shouldShowDevComponents
  ? allCharacterKeys.map((key) =>
      register(key, entriesForChar(allStats.char[key]))
    )
  : [
      Anby,
      Anton,
      Astra,
      Ben,
      Billy,
      Burnice,
      Caesar,
      Corin,
      Ellen,
      Evelyn,
      Grace,
      Harumasa,
      Hugo,
      Jane,
      Koleda,
      Lighter,
      Lucy,
      Lycaon,
      Miyabi,
      Nekomata,
      Nicole,
      Piper,
      Pulchra,
      QingYi,
      Rina,
      Seth,
      Soldier0Anby,
      Soldier11,
      Soukaku,
      Trigger,
      Vivian,
      Yanagi,
      ZhuYuan,
    ]
export default data.flat()
