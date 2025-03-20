import type { EditViewConfig, SanitizedCollectionConfig, SanitizedGlobalConfig } from 'createo'

import { documentViewKeys } from './tabs/index.js'

export const getCustomViews = (args: {
  collectionConfig: SanitizedCollectionConfig
  globalConfig: SanitizedGlobalConfig
}): EditViewConfig[] => {
  const { collectionConfig, globalConfig } = args

  let customViews: EditViewConfig[]

  if (collectionConfig) {
    const collectionViewsConfig =
      typeof collectionConfig?.admin?.components?.views?.edit === 'object' &&
      typeof collectionConfig?.admin?.components?.views?.edit !== 'function'
        ? collectionConfig?.admin?.components?.views?.edit
        : undefined

    customViews = Object.entries(collectionViewsConfig || {}).reduce((prev, [key, view]) => {
      if (documentViewKeys.includes(key)) {
        return prev
      }

      return [...prev, { ...(typeof view === 'object' && view !== null ? view : {}), key }]
    }, [])
  }

  if (globalConfig) {
    const globalViewsConfig =
      typeof globalConfig?.admin?.components?.views?.edit === 'object' &&
      typeof globalConfig?.admin?.components?.views?.edit !== 'function'
        ? globalConfig?.admin?.components?.views?.edit
        : undefined

    customViews = Object.entries(globalViewsConfig || {}).reduce((prev, [key, view]) => {
      if (documentViewKeys.includes(key)) {
        return prev
      }

      return [...prev, { ...(typeof view === 'object' && view !== null ? view : {}), key }]
    }, [])
  }

  return customViews
}
