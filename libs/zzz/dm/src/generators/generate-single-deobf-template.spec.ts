import type { Tree } from '@nx/devkit'
import { readProjectConfiguration } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'

import { generateSingleDeobfTemplateGenerator } from './generate-single-deobf-template'
import type { GenerateSingleDeobfTemplateGeneratorSchema } from './schema'

describe('generate-single-deobf-template generator', () => {
  let tree: Tree
  const options: GenerateSingleDeobfTemplateGeneratorSchema = { file: 'test' }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await generateSingleDeobfTemplateGenerator(tree, options)
    const config = readProjectConfiguration(tree, 'test')
    expect(config).toBeDefined()
  })
})
