import type { DocumentEvent } from 'createo'
import type { fieldSchemaToJSON } from 'createo/shared'

import type { PopulationsByCollection } from './types.js'

import { traverseRichText } from './traverseRichText.js'

export const traverseFields = <T>(args: {
  externallyUpdatedRelationship?: DocumentEvent
  fieldSchema: ReturnType<typeof fieldSchemaToJSON>
  incomingData: T
  localeChanged: boolean
  populationsByCollection: PopulationsByCollection
  result: T
}): void => {
  const {
    externallyUpdatedRelationship,
    fieldSchema: fieldSchemas,
    incomingData,
    localeChanged,
    populationsByCollection,
    result,
  } = args

  fieldSchemas.forEach((fieldSchema) => {
    if ('name' in fieldSchema && typeof fieldSchema.name === 'string') {
      const fieldName = fieldSchema.name

      switch (fieldSchema.type) {
        case 'array':
          if (
            !incomingData[fieldName] &&
            incomingData[fieldName] !== undefined &&
            result?.[fieldName] !== undefined
          ) {
            result[fieldName] = []
          }

          if (Array.isArray(incomingData[fieldName])) {
            result[fieldName] = incomingData[fieldName].map((incomingRow, i) => {
              if (!result[fieldName]) {
                result[fieldName] = []
              }

              if (!result[fieldName][i]) {
                result[fieldName][i] = {}
              }

              traverseFields({
                externallyUpdatedRelationship,
                fieldSchema: fieldSchema.fields,
                incomingData: incomingRow,
                localeChanged,
                populationsByCollection,
                result: result[fieldName][i],
              })

              return result[fieldName][i]
            })
          }

          break

        case 'blocks':
          if (Array.isArray(incomingData[fieldName])) {
            result[fieldName] = incomingData[fieldName].map((incomingBlock, i) => {
              const incomingBlockJSON = fieldSchema.blocks[incomingBlock.blockType]

              if (!result[fieldName]) {
                result[fieldName] = []
              }

              if (
                !result[fieldName][i] ||
                result[fieldName][i].id !== incomingBlock.id ||
                result[fieldName][i].blockType !== incomingBlock.blockType
              ) {
                result[fieldName][i] = {
                  blockType: incomingBlock.blockType,
                }
              }

              traverseFields({
                externallyUpdatedRelationship,
                fieldSchema: incomingBlockJSON.fields,
                incomingData: incomingBlock,
                localeChanged,
                populationsByCollection,
                result: result[fieldName][i],
              })

              return result[fieldName][i]
            })
          } else {
            result[fieldName] = []
          }

          break

        case 'group':
        case 'tabs':
          if (!result[fieldName]) {
            result[fieldName] = {}
          }

          traverseFields({
            externallyUpdatedRelationship,
            fieldSchema: fieldSchema.fields,
            incomingData: incomingData[fieldName] || {},
            localeChanged,
            populationsByCollection,
            result: result[fieldName],
          })

          break

        case 'relationship':
        case 'upload':
          if (fieldSchema.hasMany && Array.isArray(incomingData[fieldName])) {
            if (!result[fieldName] || !incomingData[fieldName].length) {
              result[fieldName] = []
            }

            incomingData[fieldName].forEach((incomingRelation, i) => {
              if (Array.isArray(fieldSchema.relationTo)) {
                if (!result[fieldName][i]) {
                  result[fieldName][i] = {
                    relationTo: incomingRelation.relationTo,
                  }
                }

                const oldID = result[fieldName][i]?.value?.id
                const oldRelation = result[fieldName][i]?.relationTo
                const newID = incomingRelation.value
                const newRelation = incomingRelation.relationTo

                const hasChanged = newID !== oldID || newRelation !== oldRelation

                const hasUpdated =
                  newRelation === externallyUpdatedRelationship?.entitySlug &&
                  newID === externallyUpdatedRelationship?.id

                if (hasChanged || hasUpdated || localeChanged) {
                  if (!populationsByCollection[newRelation]) {
                    populationsByCollection[newRelation] = []
                  }

                  populationsByCollection[newRelation].push({
                    id: incomingRelation.value,
                    accessor: 'value',
                    ref: result[fieldName][i],
                  })
                }
              } else {
                const hasChanged = incomingRelation !== result[fieldName][i]?.id

                const hasUpdated =
                  fieldSchema.relationTo === externallyUpdatedRelationship?.entitySlug &&
                  incomingRelation === externallyUpdatedRelationship?.id

                if (hasChanged || hasUpdated || localeChanged) {
                  if (!populationsByCollection[fieldSchema.relationTo]) {
                    populationsByCollection[fieldSchema.relationTo] = []
                  }

                  populationsByCollection[fieldSchema.relationTo].push({
                    id: incomingRelation,
                    accessor: i,
                    ref: result[fieldName],
                  })
                }
              }
            })
          } else {
            if (Array.isArray(fieldSchema.relationTo)) {
              if (!result[fieldName]) {
                result[fieldName] = {
                  relationTo: incomingData[fieldName]?.relationTo,
                }
              }

              const hasNewValue =
                incomingData[fieldName] &&
                typeof incomingData[fieldName] === 'object' &&
                incomingData[fieldName] !== null

              const hasOldValue =
                result[fieldName] &&
                typeof result[fieldName] === 'object' &&
                result[fieldName] !== null

              const newID = hasNewValue
                ? typeof incomingData[fieldName].value === 'object'
                  ? incomingData[fieldName].value.id
                  : incomingData[fieldName].value
                : ''

              const oldID = hasOldValue
                ? typeof result[fieldName].value === 'object'
                  ? result[fieldName].value.id
                  : result[fieldName].value
                : ''

              const newRelation = hasNewValue ? incomingData[fieldName].relationTo : ''
              const oldRelation = hasOldValue ? result[fieldName].relationTo : ''

              const hasChanged = newID !== oldID || newRelation !== oldRelation

              const hasUpdated =
                newRelation === externallyUpdatedRelationship?.entitySlug &&
                newID === externallyUpdatedRelationship?.id

              if (hasChanged || hasUpdated || localeChanged) {
                if (newID) {
                  if (!populationsByCollection[newRelation]) {
                    populationsByCollection[newRelation] = []
                  }

                  populationsByCollection[newRelation].push({
                    id: newID,
                    accessor: 'value',
                    ref: result[fieldName],
                  })
                } else {
                  result[fieldName] = null
                }
              }
            } else {
              const newID: number | string | undefined =
                (incomingData[fieldName] &&
                  typeof incomingData[fieldName] === 'object' &&
                  incomingData[fieldName].id) ||
                incomingData[fieldName]

              const oldID: number | string | undefined =
                (result[fieldName] &&
                  typeof result[fieldName] === 'object' &&
                  result[fieldName].id) ||
                result[fieldName]

              const hasChanged = newID !== oldID

              const hasUpdated =
                fieldSchema.relationTo === externallyUpdatedRelationship?.entitySlug &&
                newID === externallyUpdatedRelationship?.id

              if (hasChanged || hasUpdated || localeChanged) {
                if (newID) {
                  if (!populationsByCollection[fieldSchema.relationTo]) {
                    populationsByCollection[fieldSchema.relationTo] = []
                  }

                  populationsByCollection[fieldSchema.relationTo].push({
                    id: newID,
                    accessor: fieldName,
                    ref: result as Record<string, unknown>,
                  })
                } else {
                  result[fieldName] = null
                }
              }
            }
          }

          break
        case 'richText':
          result[fieldName] = traverseRichText({
            externallyUpdatedRelationship,
            incomingData: incomingData[fieldName],
            populationsByCollection,
            result: result[fieldName],
          })

          break

        default:
          result[fieldName] = incomingData[fieldName]
      }
    }
  })
}
