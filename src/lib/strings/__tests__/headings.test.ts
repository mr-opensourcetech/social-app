import {bskyTitle} from '../headings'

describe('OpenSky document titles', () => {
  it('identifies the app and its relationship to Bluesky', () => {
    expect(bskyTitle('Home')).toBe('Home — OpenSky — a Bluesky client')
  })

  it('preserves unread notification counts', () => {
    expect(bskyTitle('Notifications', '3')).toBe(
      '(3) Notifications — OpenSky — a Bluesky client',
    )
  })

  it('provides the brand title when there is no page label', () => {
    expect(bskyTitle('')).toBe('OpenSky — a Bluesky client')
  })
})
