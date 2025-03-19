'use client'

import { createClientUploadHandler } from ''

export const S3ClientUploadHandler = createClientUploadHandler({
  handler: async ({
    apiRoute,
    collectionSlug,
    file,
    prefix,
    serverHandlerPath,
    serverURL,
  }: {
    apiRoute: string
    collectionSlug: string
    file: File
    prefix: string
    serverHandlerPath: string
    serverURL: string
  }) => {
    const response = await fetch(`${serverURL}${apiRoute}${serverHandlerPath}`, {
      body: JSON.stringify({
        collectionSlug,
        filename: file.name,
        mimeType: file.type,
      }),
      credentials: 'include',
      method: 'POST',
    })

    const { url } = await response.json()

    await fetch(url, {
      body: file,
      headers: { 'Content-Length': file.size.toString(), 'Content-Type': file.type },
      method: 'PUT',
    })

    return { prefix }
  },
})
