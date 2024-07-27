import * as AssetData_gen from './AssetsData_gen.json'
import type { AssetData as AssetDataType } from './executors/gen-assets-data/executor'

export const AssetData = AssetData_gen as AssetDataType

export const CommonAssetData = {
  normalIcons: {
    sword: 'Skill_A_01',
    bow: 'Skill_A_02',
    polearm: 'Skill_A_03',
    claymore: 'Skill_A_04',
    catalyst: 'Skill_A_Catalyst_MD',
  },
  elemIcons: {
    anemo: 'UI_Buff_Element_Wind',
    geo: 'UI_Buff_Element_Rock',
    electro: 'UI_Buff_Element_Electric',
    hydro: 'UI_Buff_Element_Water',
    pyro: 'UI_Buff_Element_Fire',
    cryo: 'UI_Buff_Element_Ice',
    dendro: 'UI_Buff_Element_Grass',
  },
}
