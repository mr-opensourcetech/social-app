import {bskyTitle} from '../headings'

describe('Oursky document titles', () => {
  it('identifies the app and its relationship to Bluesky', () => {
    expect(bskyTitle('Home')).toBe('Home — Oursky — a Bluesky client')
  })

  it('preserves unread notification counts', () => {
    expect(bskyTitle('Notifications', '3')).toBe(
      '(3) Notifications — Oursky — a Bluesky client',
    )
  })

  it('provides the brand title when there is no page label', () => {
    expect(bskyTitle('')).toBe('Oursky — a Bluesky client')
  })
})
