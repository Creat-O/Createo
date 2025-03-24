import type { PayloadRequest, SelectType } from 'createo'

import { createDataloaderCacheKey } from 'createo'

type PopulateArguments = {
  collectionSlug: string
  currentDepth?: number
  data: unknown
  depth: number
  draft: boolean
  id: number | string
  key: number | string
  overrideAccess: boolean
  req: PayloadRequest
  select?: SelectType
  showHiddenFields: boolean
}

type PopulateFn = (args: PopulateArguments) => Promise<void>

export const populate: PopulateFn = async ({
  id,
  collectionSlug,
  currentDepth,
  data,
  depth,
  draft,
  key,
  overrideAccess,
  req,
  select,
  showHiddenFields,
}) => {
  const shouldPopulate = depth && currentDepth! <= depth

  if (!shouldPopulate) {
    return
  }

  const dataRef = data as Record<string, unknown>

  const doc = await req.payloadDataLoader?.load(
    createDataloaderCacheKey({
      collectionSlug,
      currentDepth: currentDepth! + 1,
      depth,
      docID: id as string,
      draft,
      fallbackLocale: req.fallbackLocale!,
      locale: req.locale!,
      overrideAccess,
      select,
      showHiddenFields,
      transactionID: req.transactionID!,
    }),
  )

  if (doc) {
    dataRef[key] = doc
  } else {
    dataRef[key] = null
  }
}
