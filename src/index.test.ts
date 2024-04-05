import crypto from 'crypto'

beforeAll(() => {
  vi.stubGlobal('crypto', crypto)
})

describe('posthog', () => {
  it('example test', () => {
    expect(true).toEqual(true)
  })
})
