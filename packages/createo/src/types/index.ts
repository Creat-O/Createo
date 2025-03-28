//@ts-strict-ignore
import type { I18n, TFunction } from '@payloadcms/translations'
import type DataLoader from 'dataloader'
import type { URL } from 'url'

import {
  DataFromCollectionSlug,
  TypeWithID,
  TypeWithTimestamps,
} from '../collections/config/types.js'
import type payload from '../index.js'
import type {
  CollectionSlug,
  DataFromGlobalSlug,
  GlobalSlug,
  Payload,
  RequestContext,
  TypedCollectionJoins,
  TypedCollectionSelect,
  TypedLocale,
  TypedUser,
} from '../index.js'
import type { Operator } from './constants.js'
export type { Payload } from '../index.js'

export type CustomPayloadRequestProperties = {
  context: RequestContext
  fallbackLocale?: string
  i18n: I18n
  locale?: 'all' | TypedLocale
  payload: typeof payload
  payloadAPI: 'GraphQL' | 'local' | 'REST'
  payloadDataLoader: {
    find: Payload['find']
  } & DataLoader<string, TypeWithID>
  payloadUploadSizes?: Record<string, Buffer>
  query: Record<string, unknown>
  responseHeaders?: Headers
  routeParams?: Record<string, unknown>
  t: TFunction
  transactionID?: number | Promise<number | string> | string
  transactionIDPromise?: Promise<void>
  user: null | TypedUser
} & Pick<
  URL,
  'hash' | 'host' | 'href' | 'origin' | 'pathname' | 'port' | 'protocol' | 'search' | 'searchParams'
>

type PayloadRequestData = {
  data?: JsonObject
  file?: {
    clientUploadContext?: unknown
    data: Buffer
    mimetype: string
    name: string
    size: number
    tempFilePath?: string
  }
}

export type PayloadRequest = CustomPayloadRequestProperties &
  Partial<Request> &
  PayloadRequestData &
  Required<Pick<Request, 'headers'>>

export type { Operator }

export type JsonValue = JsonArray | JsonObject | unknown

export type JsonArray = Array<JsonValue>

export interface JsonObject {
  [key: string]: any
}

export type WhereField = {
  [key in Operator]?: JsonValue
}

export type Where = {
  [key: string]: Where[] | WhereField
  and?: Where[]
  or?: Where[]
}

export type Sort = Array<string> | string

type SerializableValue = boolean | number | object | string
export type DefaultValue =
  | ((args: {
      locale?: TypedLocale
      req: PayloadRequest
      user: PayloadRequest['user']
    }) => SerializableValue)
  | SerializableValue

export type JoinQuery<TSlug extends CollectionSlug = string> =
  TypedCollectionJoins[TSlug] extends Record<string, string>
    ?
        | false
        | Partial<{
            [K in keyof TypedCollectionJoins[TSlug]]:
              | {
                  count?: boolean
                  limit?: number
                  page?: number
                  sort?: string
                  where?: Where
                }
              | false
          }>
    : never

export type Document = any

export type Operation = 'create' | 'delete' | 'read' | 'update'
export type VersionOperations = 'readVersions'
export type AuthOperations = 'unlock'
export type AllOperations = AuthOperations | Operation | VersionOperations

export function docHasTimestamps(doc: any): doc is TypeWithTimestamps {
  return doc?.createdAt && doc?.updatedAt
}

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N
export type IsAny<T> = IfAny<T, true, false>
export type ReplaceAny<T, DefaultType> = IsAny<T> extends true ? DefaultType : T

export type SelectIncludeType = {
  [k: string]: SelectIncludeType | true
}

export type SelectExcludeType = {
  [k: string]: false | SelectExcludeType
}

export type SelectMode = 'exclude' | 'include'

export type SelectType = SelectExcludeType | SelectIncludeType

export type ApplyDisableErrors<T, DisableErrors = false> = false extends DisableErrors
  ? T
  : null | T

export type TransformDataWithSelect<
  Data extends Record<string, any>,
  Select extends SelectType,
> = Select extends never
  ? Data
  : string extends keyof Select
    ? Data
    : string extends keyof Omit<Data, 'id'>
      ? Select extends SelectIncludeType
        ? {
            [K in Data extends TypeWithID ? 'id' | keyof Select : keyof Select]: K extends 'id'
              ? number | string
              : unknown
          }
        : Data
      : Select extends SelectIncludeType
        ? {
            [K in keyof Data as K extends keyof Select
              ? Select[K] extends object | true
                ? K
                : never
              : K extends 'id'
                ? K
                : never]: Data[K]
          }
        : {
            [K in keyof Data as K extends keyof Select
              ? Select[K] extends object | undefined
                ? K
                : never
              : K]: Data[K]
          }

export type TransformCollectionWithSelect<
  TSlug extends CollectionSlug,
  TSelect extends SelectType,
> = TSelect extends SelectType
  ? TransformDataWithSelect<DataFromCollectionSlug<TSlug>, TSelect>
  : DataFromCollectionSlug<TSlug>

export type TransformGlobalWithSelect<
  TSlug extends GlobalSlug,
  TSelect extends SelectType,
> = TSelect extends SelectType
  ? TransformDataWithSelect<DataFromGlobalSlug<TSlug>, TSelect>
  : DataFromGlobalSlug<TSlug>

export type PopulateType = Partial<TypedCollectionSelect>

export type ResolvedFilterOptions = { [collection: string]: Where }
