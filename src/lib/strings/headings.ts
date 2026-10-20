import {APP_TITLE} from '#/lib/brand'

export function bskyTitle(page: string, unreadCountLabel?: string) {
  const unreadPrefix = unreadCountLabel ? `(${unreadCountLabel}) ` : ''
  return `${unreadPrefix}${page ? `${page} — ` : ''}${APP_TITLE}`
}
