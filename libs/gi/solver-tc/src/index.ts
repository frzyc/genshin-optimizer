export * from './foreground.js'
export * from './optimizeTc.js'
const TCWorker = () =>
  new Worker(new URL('./optimizeTcWorker.ts', import.meta.url), {
    type: 'module',
  })

export { TCWorker }
