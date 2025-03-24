import type { GenericLanguages } from 'translations'

export const i18n: Partial<GenericLanguages> = {
  en: {
    placeholder: "Start typing, or press '/' for commands...",
    slashMenuBasicGroupLabel: 'Basic',
    slashMenuListGroupLabel: 'Lists',
    toolbarItemsActive: '{{count}} active',
  },
  ko: {
    placeholder: "타이핑을 시작하거나, 명령어를 입력하려면 '/'를 누르세요...",
    slashMenuBasicGroupLabel: '기본적인',
    slashMenuListGroupLabel: '목록',
    toolbarItemsActive: '{{count}} 활성화된',
  },
}
