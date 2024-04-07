// Origin: https://github.com/managed-components/mixpanel/blob/3fff278131e62ed2e81eab54880753958a07fcc4/src/index.ts

import {
  ComponentSettings,
  Manager,
  MCEvent,
  Client,
} from '@managed-components/types'
import UAParser from 'ua-parser-js'
import { isValidHttpUrl } from './utils'

const MC_COOKIE_NAME = 'mc_posthog'

const getAPIEndpoint = (POSTHOG_URL: string) => {
  POSTHOG_URL = POSTHOG_URL || 'https://us-proxy-direct.i.posthog.com'
  return `${POSTHOG_URL}/capture/`
}

const handleCookieData = (client: Client, $identified_id?: string) => {
  const cookie = client.get(MC_COOKIE_NAME)
  let cookieData: { [k: string]: string | undefined } = {}

  const setFreshCookie = () => {
    const distinct_id = crypto.randomUUID()

    cookieData = {
      distinct_id,
      $userId: $identified_id,
    }

    client.set(MC_COOKIE_NAME, encodeURIComponent(JSON.stringify(cookieData)), {
      scope: 'infinite',
    })
  }

  if (cookie) {
    try {
      cookieData = JSON.parse(decodeURIComponent(cookie))
    } catch {
      setFreshCookie()
    }

    if (!cookieData?.distinct_id) {
      setFreshCookie()
    } else if ($identified_id && !cookieData['$userId']) {
      // add userId to cookie if cookie already exists
      cookieData['$userId'] = $identified_id
      client.set(MC_COOKIE_NAME, encodeURIComponent(JSON.stringify(cookieData)))
    }
  } else {
    setFreshCookie()
  }

  return cookieData
}

const getTimestamp = (client: Client) => {
  const ts = client.timestamp || Date.now()
  return new Date(ts).toISOString()
}

const getDistinctId = (event: MCEvent) => {
  const { client, payload } = event
  const { $identified_id } = payload
  const cookieData = handleCookieData(client, $identified_id)

  return cookieData.$userId || cookieData.distinct_id || 'anonymous'
}

const getRequestBodyProperties = (event: MCEvent) => {
  const { client } = event
  const { browser, os, device } = new UAParser(
    event.client.userAgent
  ).getResult()

  return {
    ip: client.ip,
    referrer: client.referer || 'unknown',
    referring_domain: isValidHttpUrl(client.referer)
      ? new URL(client.referer).host
      : 'unknown',
    current_page_title: client.title,
    current_url: client.url.href,
    current_domain: client.url.hostname,
    current_url_path: client.url.pathname,
    current_url_search: client.url.search,
    screen_height: client.screenHeight,
    screen_width: client.screenWidth,
    browser: browser.name,
    browser_version: browser.version,
    os: os.name,
    device: device.model,
  }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const fetchObject = (url: string, requestBody: any) => {
  return {
    url: getAPIEndpoint(url),
    opts: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        HTTP_X_FORWARDED_FOR: requestBody.properties.ip,
      },
      body: JSON.stringify(requestBody),
    },
  }
}

/* Fetch Events */

export const getTrackEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const customFields = event.payload
  const { POSTHOG_URL, POSTHOG_API_KEY } = settings

  const properties = getRequestBodyProperties(event)
  const distinctID = getDistinctId(event)
  const timeStamp = getTimestamp(event.client)

  const requestBody = {
    api_key: POSTHOG_API_KEY,
    event: event.type === 'pageview' ? '$pageview' : event.type,
    timestamp: timeStamp,
    distinct_id: distinctID,
    properties: {
      ...properties,
      ...customFields,
    },
    // ref: https://posthog.com/docs/api/post-only-endpoints#single-event
  }

  return fetchObject(POSTHOG_URL, requestBody)
}

export const setAliasEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const alias = event.payload
  const { POSTHOG_URL, POSTHOG_API_KEY } = settings

  const distinctID = getDistinctId(event)
  const timeStamp = getTimestamp(event.client)

  const requestBody = {
    api_key: POSTHOG_API_KEY,
    event: '$create_alias',
    timestamp: timeStamp,
    distinct_id: distinctID,
    properties: {
      ...alias,
    },
    // ref: https://posthog.com/docs/api/post-only-endpoints#alias
  }

  return fetchObject(POSTHOG_URL, requestBody)
}

export const setIdentifyEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const customFields = event.payload
  const { POSTHOG_URL, POSTHOG_API_KEY } = settings

  const distinctID = getDistinctId(event)
  const timeStamp = getTimestamp(event.client)

  const requestBody = {
    api_key: POSTHOG_API_KEY,
    event: '$identify',
    timestamp: timeStamp,
    distinct_id: distinctID,
    properties: {
      ...customFields,
    },
    // ref: https://posthog.com/docs/api/post-only-endpoints#identify
  }

  return fetchObject(POSTHOG_URL, requestBody)
}

export const getAssignGroupPropertiesEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const { $group_key, $group_name } = event.payload
  const { POSTHOG_URL, POSTHOG_API_KEY } = settings
  const distinctID = getDistinctId(event)

  const requestBody = {
    api_key: POSTHOG_API_KEY,
    event: '$event', // API's key
    distinct_id: distinctID,
    properties: {
      $groups: { [$group_key]: $group_name }, // API's key
    },
  }

  return fetchObject(POSTHOG_URL, requestBody)
}

export const getSetGroupPropertiesEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const customFields = event.payload
  const { POSTHOG_URL, POSTHOG_API_KEY } = settings

  const requestBody = {
    api_key: POSTHOG_API_KEY,
    event: '$groupidentify', // API's key
    distinct_id: 'groups_setup_id',
    properties: {
      ...customFields,
    },
    // ref: https://posthog.com/docs/api/post-only-endpoints#group-identify
    // Expected format for customFields:
    // customFields = {
    //   "$group_type": "<group_type>",
    //   "$group_key": "<group_name>",
    //   "$group_set": {
    //     "name": "<group_name>",
    //     "subscription": "premium"
    //     "date_joined": "[optional timestamp in ISO 8601 format]"
    //   }
    // }
  }

  return fetchObject(POSTHOG_URL, requestBody)
}

export default async (manager: Manager, settings: ComponentSettings) => {
  // Log some useful info
  console.info('🆕 Posthog component loaded')
  console.info(
    '⚙️ Component config. manager:',
    JSON.stringify(manager, null, 2),
    'settings:',
    JSON.stringify(settings, null, 2)
  )

  // Event: pageview
  manager.addEventListener('pageview', async (event: MCEvent) => {
    console.info('"pageview" event received', JSON.stringify(event, null, 2))
    const { url, opts } = getTrackEventArgs(settings, event)
    // console.log('Sending:', url, opts)
    const response = await manager.fetch(url, opts)
    if (!response?.ok) {
      console.error(
        'Failed to send pageview',
        response?.status,
        response?.statusText
      )
    }
  })

  // Event: event
  manager.addEventListener('event', async (event: MCEvent) => {
    console.info('"event" event received', JSON.stringify(event, null, 2))
    const { url, opts } = getTrackEventArgs(settings, event)
    // console.log('Sending:', url, opts)
    manager.fetch(url, opts)
  })

  // Event: track
  manager.addEventListener('track', async (event: MCEvent) => {
    console.info('"track" event received', JSON.stringify(event, null, 2))
    const { url, opts } = getTrackEventArgs(settings, event)
    // console.log('Sending:', url, opts)
    const response = await manager.fetch(url, opts)
    // console.log(response)
    if (!response?.ok) {
      console.error(
        'Failed to send track',
        response?.status,
        response?.statusText
      )
    }
  })

  // Event: assign_alias
  manager.addEventListener('assign_alias', (event: MCEvent) => {
    console.info('"assign_alias" event received')
    const { url, opts } = setAliasEventArgs(settings, event)
    manager.fetch(url, opts)
  })

  // Event: identify
  manager.addEventListener('identify', (event: MCEvent) => {
    console.info('"identify" event received')
    const { url, opts } = setIdentifyEventArgs(settings, event)
    manager.fetch(url, opts)
  })

  // Event: assign_group
  manager.addEventListener('assign_group', (event: MCEvent) => {
    console.info('"assign_group" event received')
    const { url, opts } = getAssignGroupPropertiesEventArgs(settings, event)
    manager.fetch(url, opts)
  })

  // Event: set_group_property
  manager.addEventListener('set_group_property', (event: MCEvent) => {
    console.info('"set_group_property" event received')
    const { url, opts } = getSetGroupPropertiesEventArgs(settings, event)
    manager.fetch(url, opts)
  })
}
