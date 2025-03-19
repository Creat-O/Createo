'use client'
import type React from 'react'

import { useDocumentInfo } from ''

export const ShouldRenderTabs: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { id: idFromContext, collectionSlug, globalSlug } = useDocumentInfo()

  const id = idFromContext !== 'create' ? idFromContext : null

  if ((collectionSlug && id) || globalSlug) {
    return children
  }

  return null
}
