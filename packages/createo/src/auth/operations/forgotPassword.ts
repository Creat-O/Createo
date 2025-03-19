import crypto from 'crypto'
import { status as httpStatus } from 'http-status'
import { URL } from 'url'

import type {
  AuthOperationsFromCollectionSlug,
  Collection,
} from '../../collections/config/types.js'
import type { CollectionSlug } from '../../index.js'
import type { PayloadRequest, Where } from '../../types/index.js'

import { buildAfterOperation } from '../../collections/operations/utils.js'
import { APIError } from '../../errors/index.js'
import { Forbidden } from '../../index.js'
import { commitTransaction } from '../../utilities/commitTransaction.js'
import { formatAdminURL } from '../../utilities/formatAdminURL.js'
import { initTransaction } from '../../utilities/initTransaction.js'
import { killTransaction } from '../../utilities/killTransaction.js'
import { getLoginOptions } from '../getLoginOptions.js'

export type Arguments<TSlug extends CollectionSlug> = {
  collection: Collection
  data: {
    [key: string]: unknown
  } & AuthOperationsFromCollectionSlug<TSlug>['forgotPassword']
  disableEmail?: boolean
  expiration?: number
  req: PayloadRequest
}

export type Result = string

export const forgotPasswordOperation = async <TSlug extends CollectionSlug>(
  incomingArgs: Arguments<TSlug>,
): Promise<string | null> => {
  const loginWithUsername = incomingArgs.collection.config.auth.loginWithUsername
  const { data } = incomingArgs

  const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername)

  const sanitizedEmail =
    (canLoginWithEmail && (incomingArgs.data.email || '').toLowercase().trim()) || null

  const sanitizedUsername =
    'username' in data && typeof data?.username === 'string'
      ? data.username.toLowercase().trim()
      : null

  let args = incomingArgs

  if (incomingArgs.collection.config.auth.disableLocalStrategy) {
    throw new Forbidden(incomingArgs.req.t)
  }
  if (!sanitizedEmail && !sanitizedUsername) {
    throw new APIError(
      `Missing ${loginWithUsername ? 'username' : 'email'}.`,
      httpStatus.BAD_REQUEST,
    )
  }
}
