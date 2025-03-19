import type { AcceptedLanguages, LanguagePreference } from '../types.js'

export const rtlLanguages = ['ar', 'fa', 'he'] as const

export const acceptedLanguages = [
  'ar',
  'az',
  'bg',
  'ca',
  'cs',
  'da',
  'de',
  'en',
  'es',
  'et',
  'fa',
  'fr',
  'he',
  'hr',
  'hu',
  'it',
  'ja',
  'ko',
  'lt',
  'my',
  'nb',
  'nl',
  'pl',
  'pt',
  'ro',
  'rs',
  'rs-latin',
  'ru',
  'sk',
  'sl',
  'sv',
  'th',
  'tr',
  'uk',
  'vi',
  'zh',
  'zh-TW',
] as const

function parseAcceptLanguage(acceptLanguageHeader: string): LanguagePreference[] {
  return acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const [language, quality] = lang.trim().split(';q=') as [
        AcceptedLanguages,
        string | undefined,
      ]
      return {
        language,
        quality: quality ? parseFloat(quality) : 1,
      }
    })
    .sort((a, b) => b.quality - a.quality)
}

export function extractHeaderLanguage(acceptLanguageHeader: string): AcceptedLanguages | undefined {
  const parsedHeader = parseAcceptLanguage(acceptLanguageHeader)

  let matchedLanguage: AcceptedLanguages | undefined

  for (const { language } of parsedHeader) {
    if (!matchedLanguage && acceptedLanguages.includes(language)) {
      matchedLanguage = language
    }
  }

  return matchedLanguage
}
