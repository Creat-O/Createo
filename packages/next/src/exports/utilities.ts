export { getNextRequestI18n } from '../utilities/getNextRequestI18n.js'
export { getPayloadHMR } from '../utilities/getPayloadHMR.js'

import {
  addDataAndFileToRequest as _addDataAndFileToRequest,
  addLocalesToRequestFromData as _addLocalesToRequestFromData,
  createPayloadRequest as _createPayloadRequest,
  headersWithCors as _headersWithCors,
  mergeHeaders as _mergeHeaders,
  sanitizeLocales as _sanitizeLocales,
} from 'payload'

export const mergeHeaders = _mergeHeaders

export const headersWithCors = _headersWithCors

export const createPayloadRequest = _createPayloadRequest

export const addDataAndFileToRequest = _addDataAndFileToRequest

export const sanitizeLocales = _sanitizeLocales

export const addLocalesToRequestFromData = _addLocalesToRequestFromData
