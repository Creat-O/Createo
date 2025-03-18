// @ts-strict-ignore
import type { GenericLanguages, I18n } from '@payloadcms/translations'
import type { JSONSchema4 } from 'json-schema'

import type { SanitizedCollectionConfig, TypeWithID } from '../collections/config/types.js'
import type { Config, PayloadComponent, SanitizedConfig } from '../config/types.js'
import type { ValidationFieldError } from '../errors/ValidationError.js'
import type { FieldAffectingData, RichTextField, Validate } from '../fields/config/types.js'
import type { SanitizedGlobalConfig } from '../globals/config/types.js'
import type { RequestContext } from '../index.js'
import type { JsonObject, PayloadRequest, PopulateType } from '../types/index.js'
import type { RichTextFieldClientProps } from './fields/RichText.js'
import type { FieldSchemaMap } from './types.js'

export type AfterReadRichTextHookArgs<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = {
  currentDepth?: number

  depth?: number

  draft?: boolean

  fallbackLocale?: string
  fieldPromises?: Promise<void>[]

  /** Boolean to denote if this hook is running against finding one, or finding many within the afterRead hook. */
  findMany?: boolean

  flattenLocales?: boolean

  locale?: string

  /** A string relating to which operation the field type is currently executing within. */
  operation?: 'create' | 'delete' | 'read' | 'update'

  overrideAccess?: boolean

  populate?: PopulateType

  populationPromises?: Promise<void>[]
  showHiddenFields?: boolean
  triggerAccessControl?: boolean
  triggerHooks?: boolean
}

export type AfterChangeRichTextHookArgs<TData extends TypeWithID = any, TValue = any> = {
  operation: 'create' | 'update'
  previousDoc?: TData
  previousSiblingDoc?: TData
  previousValue?: TValue
}
export type BeforeValidateRichTextHookArgs<TData extends TypeWithID = any, TValue = any> = {
  operation: 'create' | 'update'
  overrideAccess?: boolean
  previousSiblingDoc?: TData
  previousValue?: TValue
}

export type BeforeChangeRichTextHookArgs<TData extends TypeWithID = any, TValue = any> = {
  docWithLocales?: JsonObject
  duplicate?: boolean
  errors?: ValidationFieldError[]
  fieldLabelPath: string
  mergeLocaleActions?: (() => Promise<void> | void)[]
  operation?: 'create' | 'delete' | 'read' | 'update'
  previousSiblingDoc?: TData
  previousValue?: TValue
  siblingDocWithLocales?: JsonObject
  skipValidation?: boolean
}

export type BaseRichTextHookArgs<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = {
  collection: null | SanitizedCollectionConfig
  context: RequestContext
  data?: Partial<TData>
  field: FieldAffectingData
  global: null | SanitizedGlobalConfig
  indexPath: number[]
  originalDoc?: TData
  parentIsLocalized: boolean
  path: (number | string)[]
  req: PayloadRequest
  schemaPath: string[]
  siblingData: Partial<TSiblingData>
  value?: TValue
}

export type AfterReadRichTextHook<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = (
  args: AfterReadRichTextHookArgs<TData, TValue, TSiblingData> &
    BaseRichTextHookArgs<TData, TValue, TSiblingData>,
) => Promise<TValue> | TValue

export type AfterChangeRichTextHook<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = (
  args: AfterChangeRichTextHookArgs<TData, TValue> &
    BaseRichTextHookArgs<TData, TValue, TSiblingData>,
) => Promise<TValue> | TValue

export type BeforeChangeRichTextHook<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = (
  args: BaseRichTextHookArgs<TData, TValue, TSiblingData> &
    BeforeChangeRichTextHookArgs<TData, TValue>,
) => Promise<TValue> | TValue

export type BeforeValidateRichTextHook<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = (
  args: BaseRichTextHookArgs<TData, TValue, TSiblingData> &
    BeforeValidateRichTextHookArgs<TData, TValue>,
) => Promise<TValue> | TValue

export type RichTextHooks = {
  afterChange?: AfterChangeRichTextHook[]
  afterRead?: AfterReadRichTextHook[]
  beforeChange?: BeforeChangeRichTextHook[]
  beforeValidate?: BeforeValidateRichTextHook[]
}
type RichTextAdapterBase<
  Value extends object = object,
  AdapterProps = any,
  ExtraFieldProperties = {},
> = {
  generateImportMap?: Config['admin']['importMap']['generators'][0]
  generateSchemaMap?: (args: {
    config: SanitizedConfig
    field: RichTextField
    i18n: I18n<any, any>
    schemaMap: FieldSchemaMap
    schemaPath: string
  }) => FieldSchemaMap
  graphQLPopulationPromises?: (data: {
    context: RequestContext
    currentDepth?: number
    depth: number
    draft: boolean
    field: RichTextField<Value, AdapterProps, ExtraFieldProperties>
    fieldPromises: Promise<void>[]
    findMany: boolean
    flattenLocales: boolean
    overrideAccess?: boolean
    parentIsLocalized: boolean
    populateArg?: PopulateType
    populationPromises: Promise<void>[]
    req: PayloadRequest
    showHiddenFields: boolean
    siblingDoc: JsonObject
  }) => void
  hooks?: RichTextHooks
  i18n?: Partial<GenericLanguages>
  outputSchema?: (args: {
    collectionIDFieldTypes: { [key: string]: 'number' | 'string' }
    config?: SanitizedConfig
    field: RichTextField<Value, AdapterProps, ExtraFieldProperties>
    i18n?: I18n
    interfaceNameDefinitions: Map<string, JSONSchema4>
    isRequired: boolean
  }) => JSONSchema4
  validate: Validate<
    Value,
    Value,
    unknown,
    RichTextField<Value, AdapterProps, ExtraFieldProperties>
  >
}

export type RichTextAdapter<
  Value extends object = any,
  AdapterProps = any,
  ExtraFieldProperties = any,
> = {
  CellComponent: PayloadComponent<never>
  FieldComponent: PayloadComponent<never, RichTextFieldClientProps>
} & RichTextAdapterBase<Value, AdapterProps, ExtraFieldProperties>

export type RichTextAdapterProvider<
  Value extends object = object,
  AdapterProps = any,
  ExtraFieldProperties = {},
> = ({
  config,
  isRoot,
  parentIsLocalized,
}: {
  config: SanitizedConfig
  isRoot?: boolean
  parentIsLocalized: boolean
}) =>
  | Promise<RichTextAdapter<Value, AdapterProps, ExtraFieldProperties>>
  | RichTextAdapter<Value, AdapterProps, ExtraFieldProperties>
