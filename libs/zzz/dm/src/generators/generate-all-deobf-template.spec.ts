import type { Tree } from '@nx/devkit'
import { readProjectConfiguration } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'

import { generateAllDeobfTemplateGenerator } from './generate-all-deobf-template'

describe('generate-all-deobf-template generator', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await generateAllDeobfTemplateGenerator(tree)
    const config = readProjectConfiguration(tree, 'test')
    expect(config).toBeDefined()
  })
})
