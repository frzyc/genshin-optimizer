import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { customRead } from '@genshin-optimizer/gi/wr'
import type { ArtifactsBySlot, RequestFilter } from '../common'
import { ComputeWorker } from './ComputeWorker'

describe('ComputeWorker keepBestPerArtifact', () => {
  test('retains the best valid build containing every artifact', () => {
    const arts: ArtifactsBySlot = {
      base: { x: 0, y: 0 },
      values: {
        flower: [
          { id: 'flower-low', values: { x: 0 } },
          { id: 'flower-high', values: { x: 1, y: 1 } },
        ],
        plume: [
          { id: 'plume-low', values: { x: 0 } },
          { id: 'plume-high', values: { x: 1 } },
        ],
        sands: [{ id: 'sands', values: { x: 1 } }],
        goblet: [{ id: 'goblet', values: { x: 1 } }],
        circlet: [{ id: 'circlet', values: { x: 1 } }],
      },
    }
    const worker = new ComputeWorker(
      {
        arts,
        optTarget: customRead(['dyn', 'x']),
        constraints: [{ value: customRead(['dyn', 'y']), min: 1 }],
        plotBase: undefined,
        topN: 1,
        keepBestPerArtifact: true,
        command: 'setup',
      },
      () => {}
    )
    const filter = Object.fromEntries(
      allArtifactSlotKeys.map((slotKey) => [
        slotKey,
        { kind: 'id', ids: new Set(arts.values[slotKey].map(({ id }) => id)) },
      ])
    ) as RequestFilter

    worker.compute(filter)
    worker.refresh(true)

    const best = Object.fromEntries(
      worker.builds.flatMap((build) =>
        build.artifactIds.map((artifactId) => [artifactId, build.value])
      )
    )
    expect(best['flower-low']).toBe(4)
    expect(best['flower-high']).toBe(5)
    expect(best['plume-low']).toBe(4)
    expect(best['plume-high']).toBe(5)
    expect(best['circlet']).toBe(5)
    expect(worker.bestBuild?.value).toBe(5)
  })
})
