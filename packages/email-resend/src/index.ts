import type { EmailAdapter, SendEmailOptions } from 'createo'

import { APIError } from 'createo'

export type ResendAdapterArgs = {
  apiKey: string
  defaultFromAddress: string
  defaultFromName: string
}

type ResendError = {
  message: string
  name: string
  statusCode: number
}

type ResendResponse = { id: string } | ResendError

type ResendAdapter = EmailAdapter<ResendResponse>

export const resendAdapter = (args: ResendAdapterArgs): ResendAdapter => {
  const { apiKey, defaultFromAddress, defaultFromName } = args

  const adapter: ResendAdapter = () => ({
    name: 'resend-rest',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message: SendEmailOptions) => {
      const sendEmailOptions = mapPayloadEmailToResendEmail(
        message,
        defaultFromAddress,
        defaultFromName,
      )

      const res = await fetch('https://api.resend.com/emails', {
        body: JSON.stringify(sendEmailOptions),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const data = (await res.json()) as ResendResponse

      if ('id' in data) {
        return data
      } else {
        const statusCode = data.statusCode || res.status
        let formattedError = `Error sending email: ${statusCode}`
        if (data.name && data.message) {
          formattedError += `${data.name} - ${data.message}`
        }

        throw new APIError(formattedError, statusCode)
      }
    },
  })

  return adapter
}

function mapPayloadEmailToResendEmail(
  message: SendEmailOptions,
  defaultFromAddress: string,
  defaultFromName: string,
): ResendSendEmailOptions {
  return {
    from: mapFromAddress(message.from, defaultFromName, defaultFromAddress),
    subject: message.subject ?? '',
    to: mapAddresses(message.to),

    bcc: mapAddresses(message.bcc),
    cc: mapAddresses(message.cc),
    reply_to: mapAddresses(message.replyTo),

    attachments: mapAttachments(message.attachments),
    html: message.html?.toString() || '',
    text: message.text?.toString() || '',
  } as ResendSendEmailOptions
}

function mapFromAddress(
  address: SendEmailOptions['from'],
  defaultFromName: string,
  defaultFromAddress: string,
): ResendSendEmailOptions['from'] {
  if (!address) {
    return `${defaultFromName} <${defaultFromAddress}>`
  }

  if (typeof address === 'string') {
    return address
  }

  return `${address.name} <${address.address}>`
}

function mapAddresses(addresses: SendEmailOptions['to']): ResendSendEmailOptions['to'] {
  if (!addresses) {
    return ''
  }

  if (typeof addresses === 'string') {
    return addresses
  }

  if (Array.isArray(addresses)) {
    return addresses.map((address) => (typeof address === 'string' ? address : address.address))
  }

  return [addresses.address]
}

function mapAttachments(
  attachments: SendEmailOptions['attachments'],
): ResendSendEmailOptions['attachments'] {
  if (!attachments) {
    return []
  }

  return attachments.map((attachment: any) => {
    if (!attachment.filename || !attachment.content) {
      throw new APIError('Attachment is missing filename or content', 400)
    }

    if (typeof attachment.content === 'string') {
      return {
        content: Buffer.from(attachment.content),
        filename: attachment.filename,
      }
    }

    if (attachment.content instanceof Buffer) {
      return {
        content: attachment.content,
        filename: attachment.filename,
      }
    }

    throw new APIError('Attachment content must be a string or a buffer', 400)
  })
}

type ResendSendEmailOptions = {
  attachments?: Attachment[]
  bcc?: string | string[]
  cc?: string | string[]
  from: string
  headers?: Record<string, string>
  html?: string
  reply_to?: string | string[]
  subject: string
  tags?: Tag[]
  text?: string
  to: string | string[]
}

type Attachment = {
  content?: Buffer | string
  filename?: false | string | undefined
  path?: string
}

export type Tag = {
  name: string
  value: string
}
