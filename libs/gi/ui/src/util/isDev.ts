export const isDev = process.env['NODE_ENV'] === 'development'

/**
 * Boolean indicating if dev components should be shown
 */
export const shouldShowDevComponents =
  isDev || process.env['NX_SHOW_DEV_COMPONENTS'] === 'true'
