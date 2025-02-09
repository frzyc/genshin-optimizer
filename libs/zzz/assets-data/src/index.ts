import * as AssetData_gen from './AssetsData_gen.json'
import type { AssetData as AssetDataType } from './executors/gen-assets-data/executor'
export type { AssetDataType }
export const AssetData = AssetData_gen as AssetDataType
