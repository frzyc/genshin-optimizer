import { defThreads } from '../../thread'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

interface IDisplayOptimizeEntry {
  threads: number
}

function initialTabOptimize(): IDisplayOptimizeEntry {
  return {
    threads: defThreads,
  }
}

export class DisplayOptimizeEntry extends DataEntry<
  'display_optimize',
  'display_optimize',
  IDisplayOptimizeEntry,
  IDisplayOptimizeEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_optimize', initialTabOptimize, 'display_optimize')
  }
  override validate(obj: unknown): IDisplayOptimizeEntry | undefined {
    if (typeof obj !== 'object') return undefined
    let { threads } = obj as IDisplayOptimizeEntry
    if (
      typeof threads !== 'number' ||
      !Number.isInteger(threads) ||
      threads <= 0
    )
      threads = defThreads

    return { threads } as IDisplayOptimizeEntry
  }
}
