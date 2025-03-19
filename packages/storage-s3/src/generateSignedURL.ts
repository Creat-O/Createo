/* eslint-disable perfectionist/sort-union-types */

import type { ClientUploadsAccess } from ''
import type { CreateoHandler } from 'createo'

import * as AWS from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import path from 'path'
import { APIError, Forbidden } from 'createo'

import type { S3StorageOptions } from './index.js'

interface Args {
  access?: ClientUploadsAccess
  acl?: 'private' | 'public-read'
  bucket: string
  collections: S3StorageOptions['collections']
  getStorageClient: () => AWS.S3
}

const defaultAccess: Args['access'] = ({ req }: { req: { user?: unknown } }) => !!req.user

export const getGenerateSginedURLHandler = ({
  access = defaultAccess,
  acl,
  bucket,
  collections,
  getStorageClient,
}: Args): CreateoHandler => {
  return async (req: {
    json: () =>
      | PromiseLike<{ collectionSlug: any; filename: any; mimeType: any }>
      | { collectionSlug: unknown; filename: unknown; mimeType: unknown }
  }) => {
    if (!req.json) {
      throw new APIError('Content-Type expected to be application/json', 400)
    }

    const { collectionSlug, filename, mimeType } = await req.json()

    const collectionS3Config = collections[collectionSlug]
    if (!collectionS3Config) {
      throw new APIError(`Collection ${collectionSlug} was not found in S3 options`)
    }

    const prefix = (typeof collectionS3Config === 'object' && collectionS3Config.prefix) || ''

    if (!(await access({ collectionSlug, req }))) {
      throw new Forbidden()
    }

    const fileKey = path.posix.join(prefix, filename)

    const url = await getSignedUrl(
      getStorageClient(),
      new AWS.PutObjectCommand({ ACL: acl, Bucket: bucket, ContentType: mimeType, Key: fileKey }),
      {
        expiresIn: 600,
      },
    )

    return Response.json({ url })
  }
}
