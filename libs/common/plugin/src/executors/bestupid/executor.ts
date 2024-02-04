import type { BestupidExecutorSchema } from './schema'

export default async function runExecutor(options: BestupidExecutorSchema) {
  console.log('Executor ran for Bestupid', options)
  return {
    success: true,
  }
}
