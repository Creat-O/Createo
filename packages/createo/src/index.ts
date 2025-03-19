import type { ExecutionResult, GraphQLSchema, ValidationRule } from 'graphql'
import type { Request as graphQLRequest, OperationArgs } from 'graphql-http'
import type { Logger } from 'pino'
import type { NonNever } from 'ts-essentials'

import { spawn } from 'child_process'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import WebSocket from 'ws'

import type { AuthArgs } from './auth/operations/auth.js'
import type { Result as ForgotPasswordResult } from './auth/operations/forgotPassword.js'
