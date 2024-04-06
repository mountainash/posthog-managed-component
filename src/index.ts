import { ComponentSettings, Manager } from '@managed-components/types'

export default async function (manager: Manager, settings: ComponentSettings) {
  if (!settings.POSTHOG_API_KEY) {
    console.error('POSTHOG_API_KEY is required for the PostHog component')
    return
  }

  console.info('PROJECT_ID:', settings.POSTHOG_API_KEY.slice(0, 12) + '...')

  manager.addEventListener('clientcreated', ({ client }) => {
    console.log('clientcreated!: 🐣')
    const clientNumber = client.get('clientNumber')
    if (!clientNumber) {
      const num = Math.random()
      client.set('clientNumber', num.toString())
    }
  })

  manager.addEventListener('pageview', async event => {
    const { client } = event

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: String(settings.POSTHOG_API_KEY),
        event: 'request',
        properties: {
          distinct_id: client.get('clientNumber') || 'anonymous',
        },
      }),
    }

    const url = settings.POSTHOG_URL || 'https://app.posthog.com'

    await fetch(`${url}/capture/`, options)
      .then(res => res.json())
      .then(data => {
        console.log(data)
      })

    console.info(
      '📄 Pageview received!',
      client.get('clientNumber'),
      client.get('user_id'),
      client.get('last_page_title'),
      client.get('session_id')
    )
    // const user_id = client.url.searchParams.get('user_id')
    // client.set('user_id', user_id, {
    //   scope: 'infinite',
    // })
    // if (client.get('clientNumber')) {
    //   client.attachEvent('mousemove')
    //   client.attachEvent('mousedown')
    //   client.attachEvent('historyChange')
    //   client.attachEvent('scroll')
    //   client.attachEvent('resize')
    //   client.attachEvent('resourcePerformanceEntry')
    // }
    // client.title &&
    //   client.set('last_page_title', client.title, {
    //     scope: 'page',
    //   })
    // client.set('session_id', 'session_date_' + new Date().toUTCString(), {
    //   scope: 'session',
    // })
    // client.return('Some very important value')
    // client.execute('console.info("Page view processed by Demo Component")')
    // client.fetch('http://example.com', { mode: 'no-cors' })
  })

  // const myRoute = manager.route('/resetCache', (request: Request) => {
  //   manager.invalidateCache('weather-Iceland')
  //   manager.invalidateCache('weather-Tobago')
  //   manager.invalidateCache('weather-Kyoto')
  //   return new Response(`You made a ${request.method} request`)
  // })
  // console.log(':::: exposes an endpoint at', myRoute)

  //   const myProxiedRoute = manager.proxy('/gate/*', 'http://n-gate.com')
  //   console.log(`:::: proxies ${myProxiedRoute} to http://n-gate.com`)
  //
  //   const myStaticFile = manager.serve('/cheese', 'assets/Camembert.jpg')
  //   console.log(`:::: serves a file at ${myStaticFile}`)

  // if (settings.ecommerce) {
  //   manager.addEventListener('ecommerce', event => {
  //     console.log('event:', event)
  //     if (event.name === 'Purchase') {
  //       // TODO: Send the purchase event to the server
  //       console.info('Ka-ching! 💰', event.payload)
  //     }
  //   })
  // }

  // manager.addEventListener('request', event => {
  //   console.log('event:', event.payload)
  //   console.log('\u{1F6D2} 🧱 Triggered by every request')
  // })

  // manager.addEventListener('response', event => {
  //   console.log('event:', event.payload)
  //   console.log('\u{1F6D2} 🎁 Doing something on response')
  // })

  // manager.addEventListener('remarketing', event => {
  //   console.log('event:', event.payload)
  //   console.log('🛒 Remarketing event was sent to demo component')
  // })

  // manager.createEventListener('mousemove', async event => {
  //   const { payload } = event
  //   console.info('🐁 🪤 Mousemove:', JSON.stringify(payload, null, 2))
  // })

  // manager.createEventListener('mousedown', async event => {
  //   // Save mouse coordinates as a cookie
  //   const { client, payload } = event
  //   console.info('🐁 ⬇️ Mousedown payload:', payload)
  //   const [firstClick] = payload.mousedown
  //   client.set('lastClickX', firstClick.clientX)
  //   client.set('lastClickY', firstClick.clientY)
  // })

  // manager.createEventListener('historyChange', async event => {
  //   console.info('📣 Ch Ch Ch Chaaanges to history detected!', event.payload)
  // })

  // manager.createEventListener('resize', async event => {
  //   console.info('🪟 New window size!', JSON.stringify(event.payload, null, 2))
  // })

  // manager.createEventListener('scroll', async event => {
  //   console.info(
  //     '🛞🛞🛞 They see me scrollin...they hatin...',
  //     JSON.stringify(event.payload, null, 2)
  //   )
  // })

  // manager.createEventListener('resourcePerformanceEntry', async event => {
  //   console.info(
  //     'Witness the fitness - fresh resource performance entries',
  //     JSON.stringify(event.payload, null, 2)
  //   )
  // })

  //   manager.addEventListener('event', async event => {
  //     const { client, payload } = event
  //     if (payload.name === 'cheese') {
  //       console.info('🧀🧀  cheese event! 🧀🧀')
  //       client.execute('console.log("🧀🧀  cheese event! 🧀🧀")')
  //     }
  //     payload.user_id = client.get('user_id')
  //
  //     if (Object.keys(payload || {}).length) {
  //       const params = new URLSearchParams(payload).toString()
  //       manager.fetch(`http://www.example.com/?${params}`)
  //     }
  //   })

  // manager.registerEmbed(
  //   'weather-example',
  //   async ({ parameters }: { parameters: { [k: string]: unknown } }) => {
  //     const location = parameters['location']
  //     const embed = await manager.useCache('weather-' + location, async () => {
  //       try {
  //         const response = await manager.fetch(
  //           `https://wttr.in/${location}?format=j1`
  //         )
  //         const data = await response.json()
  //         const [summary] = data.current_condition
  //         const { temp_C } = summary
  //         return `<p>Temperature in ${location} is: ${temp_C} &#8451;</p>`
  //       } catch (error) {
  //         console.error('error fetching weather for embed:', error)
  //       }
  //     })
  //     return embed
  //   }
  // )

  // manager.registerWidget(async () => {
  //   const location = 'Colombia'
  //   const widget = await manager.useCache('weather-' + location, async () => {
  //     try {
  //       const response = await manager.fetch(
  //         `https://wttr.in/${location}?format=j1`
  //       )
  //       const data = await response.json()
  //       const [summary] = data.current_condition
  //       const { temp_C } = summary
  //       return `<p>Temperature in ${location} is: ${temp_C} &#8451;</p>`
  //     } catch (error) {
  //       console.error('error fetching weather for widget:', error)
  //     }
  //   })
  //   return widget
  // })
}
