export * from './foreground'
export * from './optimizeTc'
const TCWorker = () =>
  new Worker(new URL('./optimizeTcWorker.ts', import.meta.url), {
    type: 'module',
  })

export { TCWorker }
