/* eslint-disable  @typescript-eslint/no-explicit-any */
// Origin: https://github.com/managed-components/PostHog/blob/3fff278131e62ed2e81eab54880753958a07fcc4/src/index.test.ts

import { MCEvent } from '@managed-components/types'
import {
  getTrackEventArgs,
  setAliasEventArgs,
  setIdentifyEventArgs,
  getAssignGroupPropertiesEventArgs,
  getSetGroupPropertiesEventArgs,
} from '.'

const settings = {
  POSTHOG_API_KEY: '12345',
  POSTHOG_URL: 'https://us-proxy-direct.i.posthog.com',
  MC_COOKIE_NAME: 'mc_posthog',
}

const cookie = encodeURIComponent(
  JSON.stringify({
    distinct_id: 'f477ebf8-0ddc-451f-8091-65effa05ec87',
    $userId: undefined,
  })
)
const cookieData = JSON.parse(decodeURIComponent(cookie))

const dummyClient = {
  emitter: 'browser',
  url: new URL('http://127.0.0.1:1337'),
  title: 'Zaraz "Test" /t Page',
  timestamp: 1712444841992,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  language: 'en-GB',
  referer: '',
  ip: '127.0.0.1',
  screenHeight: 1080,
  screenWidth: 2560,
  fetch: () => undefined,
  set: () => undefined,
  execute: () => undefined,
  return: () => undefined,
  get: (key: string) => {
    if (key === settings.MC_COOKIE_NAME) {
      return cookie
    }
  },
  attachEvent: () => undefined,
  detachEvent: () => undefined,
}

// const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('PostHog MC track event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('track', {}) as unknown as MCEvent
  // @ts-expect-error - payload is read only
  fakeEvent.payload = {
    event: 'track',
    someData: 'some_value',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getTrackEventArgs(settings, fakeEvent)

  it('creates the PostHog track request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(`${settings.POSTHOG_URL}/capture/`)
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['Content-Type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)

    expect(body?.event).toEqual(fakeEvent.payload.event)
    expect(body?.distinct_id).toEqual(cookieData.distinct_id)
    expect(body?.timestamp).toEqual(
      String(new Date(fakeEvent.client.timestamp).toISOString())
    )
    // expect(body?.properties?.$insert_id).toMatch(uuidPattern)
    expect(body?.properties?.ip).toEqual(fakeEvent.client.ip)
    expect(body?.properties?.referrer).toEqual('unknown')
    expect(body?.properties?.referring_domain).toEqual('unknown')
    expect(body?.properties?.current_url).toEqual(fakeEvent.client.url.href)
    expect(body?.properties?.screen_height).toEqual(
      fakeEvent.client.screenHeight
    )
    expect(body?.properties?.screen_width).toEqual(fakeEvent.client.screenWidth)
    expect(body?.properties?.browser).toEqual('Chrome')
    expect(body?.properties?.browser_version).toEqual('108.0.0.0')
    expect(body?.properties?.os).toEqual('Mac OS')
    expect(body?.properties?.someData).toEqual(fakeEvent.payload.someData)
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('PostHog MC assign_alias event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('assign_alias', {}) as unknown as MCEvent
  // @ts-expect-error - payload is read only
  fakeEvent.payload = {
    alias: 'alias_12345',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = setAliasEventArgs(settings, fakeEvent)

  it('creates the PostHog alias request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(`${settings.POSTHOG_URL}/capture/`)
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['Content-Type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)

    expect(body?.event).toEqual('$create_alias')
    expect(body?.distinct_id).toEqual(cookieData.distinct_id)
    expect(body?.timestamp).toEqual(
      new Date(fakeEvent.client.timestamp).toISOString()
    )
    expect(body?.properties?.alias).toEqual(fakeEvent.payload.alias)
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('PostHog MC identify event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('identify', {}) as unknown as MCEvent
  // @ts-expect-error - payload is read only
  fakeEvent.payload = {
    $identified_id: 'user_12345',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = setIdentifyEventArgs(settings, fakeEvent)

  it('creates the PostHog identify request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(`${settings.POSTHOG_URL}/capture/`)
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['Content-Type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)

    expect(body?.event).toEqual('$identify')
    expect(body?.distinct_id).toEqual(fakeEvent.payload.$identified_id)
    expect(body?.timestamp).toEqual(
      new Date(fakeEvent.client.timestamp).toISOString()
    )
    expect(body?.properties?.$identified_id).toEqual(
      fakeEvent.payload.$identified_id
    )
  })

  it('updates the cookie correctly', () => {
    expect(setCookie).toBeTruthy()
    expect(setCookie.key).toEqual(settings.MC_COOKIE_NAME)

    const setCookieData = JSON.parse(decodeURIComponent(setCookie.value))
    expect(setCookieData.distinct_id).toEqual(cookieData.distinct_id)
    expect(setCookieData.$userId).toEqual(fakeEvent.payload.$identified_id)
  })
})

describe('PostHog MC assign_group event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('assign_group', {}) as unknown as MCEvent
  // @ts-expect-error - payload is read only
  fakeEvent.payload = {
    $groups: { group1: 'value1', group2: 'value2' },
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getAssignGroupPropertiesEventArgs(settings, fakeEvent)

  it('creates the PostHog alias request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(`${settings.POSTHOG_URL}/capture/`)
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['Content-Type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)

    expect(body).toBeTruthy()
    expect(body.distinct_id).toEqual(cookieData.distinct_id)
    // TODO: Finish this test
    // expect(body.$union).toBeTruthy()
    // expect(body.$union.someProp).toHaveLength(4)
    // expect(body.$union.someProp).toContain('value1')
    // expect(body.$union.someProp).toContain('value2')
    // expect(body.$union.someProp).toContain('value3')
    // expect(body.$union.someProp).toContain('value4')
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('PostHog MC set_group_property event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('set_group_property', {}) as unknown as MCEvent
  // @ts-expect-error - payload is read only
  fakeEvent.payload = {
    $group_type: 'group_type',
    $group_key: 'group_key',
    $group_set: {
      name: 'customer',
      subscription: 'premium',
      date_joined: new Date(Date.now()).toISOString(),
    },
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getSetGroupPropertiesEventArgs(settings, fakeEvent)

  it('creates the PostHog set group request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(`${settings.POSTHOG_URL}/capture/`)
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['Content-Type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)

    expect(body).toBeTruthy()
    expect(body.distinct_id).toEqual('groups_setup_id')
    // TODO: Finish this test
    expect(body.properties.$group_type).toEqual(fakeEvent.payload.$group_type)
    expect(body.properties.$group_key).toEqual(fakeEvent.payload.$group_key)
    expect(body.properties.$group_set).toBeTruthy()
    expect(body.properties.$group_set.someProp).toEqual(
      fakeEvent.payload.someProp
    )
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})
