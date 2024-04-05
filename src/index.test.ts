import crypto from 'crypto'

beforeAll(() => {
  vi.stubGlobal('crypto', crypto)
})

describe('postman', () => {
  it('example test', () => {
    expect(true).toEqual(true)
  })
})
