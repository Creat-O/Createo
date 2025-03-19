import type * as AWS from '@aws-sdk/client-s3'
import type { HandleDelete } from ''

import path from 'path'

interface Args {
  bucket: string
  getStorageClient: () => AWS.S3
}

export const getHandleDelete = ({ bucket, getStorageClient }: Args): HandleDelete => {
  return async ({
    doc: { prefix = '' },
    filename,
  }: {
    doc: { prefix?: string }
    filename: string
  }) => {
    await getStorageClient().deleteObject({
      Bucket: bucket,
      Key: path.posix.join(prefix, filename),
    })
  }
}
