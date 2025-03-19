'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import React, { useEffect } from 'react'

export default function GlobalError({ error }: { error: { digest?: string } & Error }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error)
    }
  }, [error])

  return (
    <html lang="en-US">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
