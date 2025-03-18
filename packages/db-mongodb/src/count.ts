import type { CountOptions } from 'mongodb'
import type { Count } from 'payload'

import { flattenWhereToOperators } from 'payload'

import type { MongooseAdapter } from './index.js'

import { buildQuery } from './queries/buildQuery.js'
import { getCollection } from './utilities/getEntity.js'
import { getSession } from './utilities/getSession.js'

export const count: Count = async function count(
  this: MongooseAdapter,
  {
    collection: collectionSlug,
    locale,
    req,
    where = {},
  }: { collection: string; locale: string; req: any; where?: any },
) {
  const { collectionConfig, Model } = getCollection({ adapter: this, collectionSlug })

  const options: CountOptions = {
    session: await getSession(this, req),
  }

  let hasNearConstraint = false

  if (where) {
    const constraints = flattenWhereToOperators(where)
    hasNearConstraint = constraints.some((prop: any) =>
      Object.keys(prop).some((key) => key === 'near'),
    )
  }

  const query = await buildQuery({
    adapter: this,
    collectionSlug,
    fields: collectionConfig.flattenedFields,
    locale,
    where,
  })

  const useEstimatedCount = hasNearConstraint || !query || Object.keys(query).length === 0

  if (!useEstimatedCount && Object.keys(query).length === 0 && this.disableIndexHints !== true) {
    options.hint = {
      _id: 1,
    }
  }

  let result: number
  if (useEstimatedCount) {
    result = await Model.estimatedDocumentCount({ session: options.session })
  } else {
    result = await Model.countDocuments(query, options)
  }

  return {
    totalDocs: result,
  }
}
